import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, IconButton, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon, Info as InfoIcon } from '@mui/icons-material';
import ReactFlow, { Background, Controls, MiniMap, useEdgesState, useNodesState, Node, Edge, NodeProps, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { useAutomationFlows } from '../../contexts/automation-flow.context';
import { useStore } from '../../contexts/store.context';

const AutomationDetailsPage: React.FC = () => {
  const { automationId } = useParams<{ automationId: string }>();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { flows, getByStoreId } = useAutomationFlows();

  const flow = useMemo(() => flows.find((f) => f._id === automationId), [flows, automationId]);

  useEffect(() => {
    if (!flow && activeStoreId) {
      getByStoreId(activeStoreId).catch(() => {});
    }
  }, [flow, activeStoreId, getByStoreId]);

  const savedNodes = (flow?.flowData?.nodes || []) as Node[];
  const savedEdges = (flow?.flowData?.edges || []) as Edge[];
  const [nodes, setNodes, onNodesChange] = useNodesState(savedNodes);
  const [edges, , onEdgesChange] = useEdgesState(savedEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const initialSnapshotRef = useRef<{ nodes: any; edges: any } | null>(null);
  const { update } = useAutomationFlows();

  const normalize = (n: Node[]) => n.map(x => ({ id: x.id, type: x.type, position: x.position, data: x.data }));
  const normalizeEdges = (e: Edge[]) => e.map(x => ({ id: x.id, source: x.source, target: x.target, label: (x as any).label, style: (x as any).style }));

  useEffect(() => {
    // Capture initial snapshot once when flow data is available
    if (!initialSnapshotRef.current) {
      initialSnapshotRef.current = {
        nodes: normalize(savedNodes),
        edges: normalizeEdges(savedEdges),
      };
      setIsDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automationId, savedNodes, savedEdges]);

  const handleNodesChange = React.useCallback((changes: any) => {
    onNodesChange(changes);
    // Compare current with initial snapshot
    const init = initialSnapshotRef.current;
    if (init) {
      const cur = normalize(nodes);
      setIsDirty(JSON.stringify(cur) !== JSON.stringify(init.nodes));
    }
  }, [onNodesChange, nodes]);

  const handleEdgesChange = React.useCallback((changes: any) => {
    onEdgesChange(changes);
    const init = initialSnapshotRef.current;
    if (init) {
      const cur = normalizeEdges(edges);
      setIsDirty(JSON.stringify(cur) !== JSON.stringify(init.edges));
    }
  }, [onEdgesChange, edges]);

  interface TriggerNodeData { label: string }
  interface ConditionNodeData { label: string; variable?: string; operator?: string; value?: string }
  interface ActionNodeData { label: string; actionType?: string }

  const TriggerNode: React.FC<NodeProps<TriggerNodeData>> = ({ data, selected }) => (
    <Box sx={{
      backgroundColor: selected ? '#f5f7ff' : 'white',
      border: `2px solid ${selected ? '#4f46e5' : '#6366f1'}`,
      borderRadius: 2, p: 2, minWidth: 150, position: 'relative'
    }}>
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center' }}>{data.label || 'Trigger'}</Typography>
      <Handle type="source" position={Position.Bottom} style={{ bottom: -8 }} />
    </Box>
  );

  const ConditionNode: React.FC<NodeProps<ConditionNodeData>> = ({ data, selected }) => (
    <Box sx={{
      backgroundColor: selected ? '#f5f7ff' : 'white',
      border: `2px solid ${selected ? '#4f46e5' : '#6366f1'}`,
      borderRadius: 2, p: 2, minWidth: 200, position: 'relative'
    }}>
      <Handle type="target" position={Position.Top} style={{ bottom: -8 }} />
      <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center', mb: 1 }}>Condition</Typography>
      {data.variable && (
        <Box sx={{ mb: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Variable</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{data.variable}</Typography>
          {data.operator && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Operator</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{data.operator}</Typography>
            </>
          )}
          {data.value && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Value</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{data.value}</Typography>
            </>
          )}
        </Box>
      )}
      <Handle type="source" position={Position.Bottom} style={{ bottom: -8 }} />
    </Box>
  );

  const nodeTypes = useMemo(() => ({ trigger: TriggerNode, condition: ConditionNode }), []);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative' }}>
      <Paper
        elevation={1}
        sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 0 }}
      >
        <IconButton onClick={() => navigate('/marketing/automations')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {flow?.name || 'Automation'}
        </Typography>
      </Paper>

      <Box sx={{ height: '100%', width: '100%', pt: 8, display: 'flex' }}>
        <Box sx={{ flex: 1, height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeClick={(e, n) => { e.stopPropagation(); setSelectedNodeId(n.id); }}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            {/* @ts-ignore */}
            <Background variant="dots" gap={20} size={1} color="#e0e0e0" />
            {/* @ts-ignore */}
            <Controls />
            {/* @ts-ignore */}
            <MiniMap />
          </ReactFlow>
        </Box>

        {/* Right Sidebar - mirrors create page, read-only details */}
        <Paper elevation={2} sx={{ width: 320, height: '100%', borderRadius: 0, borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
          {selectedNodeId && nodes.find((n) => n.id === selectedNodeId && n.type === 'condition') ? (
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Condition</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Take different actions based on the conditions you set</Typography>
                  <InfoIcon sx={{ color: 'text.secondary', fontSize: 16, mt: 0.25 }} />
                </Box>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>IF</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="operator-label">Operator</InputLabel>
                  <Select labelId="operator-label" label="Operator" value={(nodes.find((n) => n.id === selectedNodeId)?.data as any)?.operator || ''} disabled>
                    <MenuItem value="equal">Equal to</MenuItem>
                    <MenuItem value="not-equal">Not equal to</MenuItem>
                    <MenuItem value="greater-than">Greater than</MenuItem>
                    <MenuItem value="greater-than-or-equal">Greater than or equal to</MenuItem>
                    <MenuItem value="less-than">Less than</MenuItem>
                    <MenuItem value="less-than-or-equal">Less than or equal to</MenuItem>
                    <MenuItem value="is-at-least-one-of">Is at least one of</MenuItem>
                    <MenuItem value="is-not-any-of">Is not any of</MenuItem>
                    <MenuItem value="does-not-exist">Does not exist</MenuItem>
                    <MenuItem value="exists">Exists</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa' }}>
                  <Typography variant="body2" color="text.secondary">Variable</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{(nodes.find((n) => n.id === selectedNodeId)?.data as any)?.variable || '-'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Value</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{(nodes.find((n) => n.id === selectedNodeId)?.data as any)?.value || '-'}</Typography>
                </Box>
              </Box>
            </>
          ) : selectedNodeId && nodes.find((n) => n.id === selectedNodeId && n.type === 'action') ? (
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Action</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {(nodes.find((n) => n.id === selectedNodeId)?.data as any)?.label || 'Action'}
                </Typography>
              </Box>
            </>
          ) : selectedNodeId && nodes.find((n) => n.id === selectedNodeId && n.type === 'trigger') ? (
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Trigger</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {(nodes.find((n) => n.id === selectedNodeId)?.data as any)?.label || 'Trigger'}
                </Typography>
              </Box>
            </>
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">Select a node to view details.</Typography>
            </Box>
          )}
        </Paper>
      </Box>
      {isDirty && (
        <Box sx={{ position: 'absolute', bottom: 80, right: 24 }}>
          <Paper elevation={3} sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2">Unsaved changes</Typography>
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                if (!flow?._id) return;
                const newFlowData = {
                  ...(flow.flowData || {}),
                  nodes,
                  edges,
                };
                try {
                  await update(flow._id, { flowData: newFlowData });
                  // refresh baseline snapshot
                  initialSnapshotRef.current = { nodes: normalize(nodes), edges: normalizeEdges(edges) };
                  setIsDirty(false);
                } catch (e) {
                  // noop; toast handled in context
                }
              }}
            >
              Update
            </Button>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AutomationDetailsPage;



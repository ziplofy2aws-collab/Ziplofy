import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTriggers } from '../../contexts/trigger.context';
import { useActions } from '../../contexts/action.context';
import { useAutomationFlows } from '../../contexts/automation-flow.context';
import { useStore } from '../../contexts/store.context';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Panel,
  ConnectionLineType,
  Handle,
  Position,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Initial nodes will be set up in the component with callbacks
const initialNodes: Node<TriggerNodeData>[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    data: { label: 'Trigger' },
    position: { x: 250, y: 100 },
  },
];

const initialEdges: Edge[] = [];

// Custom Trigger Node Component
interface TriggerNodeData {
  label: string;
  onAddAction?: () => void;
  onAddCondition?: () => void;
  isTriggerSelected?: boolean;
  canHaveConditions?: boolean;
  onRequestDelete?: (id: string, type: 'trigger' | 'condition' | 'action' | 'otherwise') => void;
}

// Custom Condition Node Component
interface ConditionNodeData {
  label: string;
  variable?: string | null;
  operator?: string;
  value?: string;
  onAddAction?: () => void;
  onAddCondition?: () => void;
  onAddOtherwise?: () => void;
  onRequestDelete?: (id: string, type: 'trigger' | 'condition' | 'action' | 'otherwise') => void;
}

const TriggerNode: React.FC<NodeProps<TriggerNodeData>> = ({ data, selected, id }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const open = Boolean(anchorEl);

  const handleThenClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    // Clear any hover timeout if exists
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    // Toggle menu on click
    if (anchorEl === event.currentTarget) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleThenMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    // Only show on hover if menu is not already open
    if (!anchorEl) {
      // Clear any existing timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      // Show menu after a short delay on hover
      const timeout = setTimeout(() => {
        setAnchorEl(event.currentTarget);
      }, 500);
      setHoverTimeout(timeout);
    }
  };

  const handleThenMouseLeave = () => {
    // Only close on mouse leave if we're not clicking (let click handler manage state)
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    // Don't auto-close on mouse leave - let user click to close or click outside
  };

  const handleClose = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setAnchorEl(null);
  };

  const handleAddAction = () => {
    data.onAddAction?.();
    handleClose();
  };

  const handleAddCondition = () => {
    data.onAddCondition?.();
    handleClose();
  };

  return (
    <Box
      sx={{
        backgroundColor: selected ? '#f5f7ff' : 'white',
        border: `2px solid ${selected ? '#4f46e5' : '#6366f1'}`,
        borderRadius: 2,
        padding: 2,
        minWidth: 150,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); data.onRequestDelete?.(id, 'trigger'); }} sx={{ color: 'text.secondary' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: 'hidden' }}
      />
      
      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          textAlign: 'center',
          mb: 1,
        }}
      >
        {data.label || 'Trigger'}
      </Typography>

      {data.isTriggerSelected && (
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 1,
            pr: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#6366f1',
              cursor: 'pointer',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onMouseEnter={handleThenMouseEnter}
            onMouseLeave={handleThenMouseLeave}
            onClick={handleThenClick}
          >
            then
          </Typography>
          
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
            }}
            disableAutoFocusItem
            disablePortal={false}
            sx={{
              zIndex: 9999,
            }}
            PaperProps={{
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
              },
              onMouseDown: (e: React.MouseEvent) => {
                e.stopPropagation();
              },
              sx: {
                pointerEvents: 'auto',
              },
            }}
            MenuListProps={{
              'aria-labelledby': 'then-button',
              onClick: (e) => {
                e.stopPropagation();
              },
              onMouseDown: (e) => {
                e.stopPropagation();
              },
            }}
          >
            {data.canHaveConditions && (
              <MenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddCondition();
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
              >
                Condition
              </MenuItem>
            )}
            <MenuItem 
              onClick={(e) => {
                e.stopPropagation();
                handleAddAction();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              Action
            </MenuItem>
          </Menu>
        </Box>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ bottom: -8 }}
      />
    </Box>
  );
};

// Custom Condition Node Component
const ConditionNode: React.FC<NodeProps<ConditionNodeData>> = ({ data, id, selected }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const open = Boolean(anchorEl);

  const handleThenClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    if (anchorEl === event.currentTarget) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleThenMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (!anchorEl) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      const timeout = setTimeout(() => {
        setAnchorEl(event.currentTarget);
      }, 500);
      setHoverTimeout(timeout);
    }
  };

  const handleThenMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleClose = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setAnchorEl(null);
  };

  const handleAddAction = () => {
    data.onAddAction?.();
    handleClose();
  };

  const handleAddCondition = () => {
    data.onAddCondition?.();
    handleClose();
  };

  const handleAddOtherwise = () => {
    if (data.onAddOtherwise) {
      data.onAddOtherwise();
    }
    handleClose();
  };

  const getOperatorLabel = (operator: string) => {
    const operatorMap: Record<string, string> = {
      'equal': 'Equal to',
      'not-equal': 'Not equal to',
      'greater-than': 'Greater than',
      'greater-than-or-equal': 'Greater than or equal to',
      'less-than': 'Less than',
      'less-than-or-equal': 'Less than or equal to',
      'is-at-least-one-of': 'Is at least one of',
      'is-not-any-of': 'Is not any of',
      'does-not-exist': 'Does not exist',
      'exists': 'Exists',
    };
    return operatorMap[operator] || operator;
  };

  return (
    <Box
      sx={{
        backgroundColor: selected ? '#f5f7ff' : 'white',
        border: `2px solid ${selected ? '#4f46e5' : '#6366f1'}`,
        borderRadius: 2,
        padding: 2,
        minWidth: 200,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 0.5 }}>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); data.onRequestDelete?.(id, 'condition'); }} sx={{ color: 'text.secondary' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      <Handle
        type="target"
        position={Position.Top}
        style={{ bottom: -8 }}
      />
      
      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          textAlign: 'center',
          mb: 1,
        }}
      >
        Condition
      </Typography>

      {data.variable && (
        <Box sx={{ mb: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Variable
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {data.variable}
          </Typography>
          {data.operator && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Operator
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {getOperatorLabel(data.operator)}
              </Typography>
            </>
          )}
          {data.value && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Value
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {data.value}
              </Typography>
            </>
          )}
        </Box>
      )}

      {data.variable && (
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1,
            mt: 1,
            pr: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#6366f1',
              cursor: 'pointer',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onMouseEnter={handleThenMouseEnter}
            onMouseLeave={handleThenMouseLeave}
            onClick={handleThenClick}
          >
            then
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleAddOtherwise();
            }}
          >
            otherwise
          </Typography>
          
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
            }}
            disableAutoFocusItem
            disablePortal={false}
            sx={{
              zIndex: 9999,
            }}
            PaperProps={{
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
              },
              onMouseDown: (e: React.MouseEvent) => {
                e.stopPropagation();
              },
              sx: {
                pointerEvents: 'auto',
              },
            }}
            MenuListProps={{
              'aria-labelledby': 'then-button',
              onClick: (e) => {
                e.stopPropagation();
              },
              onMouseDown: (e) => {
                e.stopPropagation();
              },
            }}
          >
            <MenuItem 
              onClick={(e) => {
                e.stopPropagation();
                handleAddCondition();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              Condition
            </MenuItem>
            <MenuItem 
              onClick={(e) => {
                e.stopPropagation();
                handleAddAction();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              Action
            </MenuItem>
          </Menu>
        </Box>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ bottom: -8 }}
      />
    </Box>
  );
};

const AutomationCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [openVariableModal, setOpenVariableModal] = useState(false);
  const [variableSearchQuery, setVariableSearchQuery] = useState('');
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string>('equal');
  const [editingDescription, setEditingDescription] = useState<boolean>(false);
  const [descriptionDraft, setDescriptionDraft] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'trigger' | 'condition' | 'action' | 'otherwise' } | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [flowNameError, setFlowNameError] = useState<string | null>(null);

  const addActionNode = useCallback((setNodes: any, setEdges: any, sourceNodeId?: string) => {
    setNodes((nds: Node[]) => {
      const sourceNode = sourceNodeId ? nds.find((n) => n.id === sourceNodeId) : nds.find((n) => n.id === 'trigger-1');
      if (sourceNode) {
        const newNode: Node = {
          id: `action-${Date.now()}`,
          type: 'action',
          data: { label: 'Action' },
          position: {
            x: sourceNode.position.x,
            y: sourceNode.position.y + 150,
          },
        };
        
        // Automatically connect source to action
        setEdges((eds: Edge[]) => {
          const newEdge: Edge = {
            id: `edge-${sourceNode.id}-${newNode.id}`,
            source: sourceNode.id,
            target: newNode.id,
          };
          return [...eds, newEdge];
        });
        
        return [...nds, newNode];
      }
      return nds;
    });
  }, []);

  const addOtherwiseNode = useCallback((setNodes: any, setEdges: any, sourceNodeId?: string) => {
    setNodes((nds: Node[]) => {
      const sourceNode = sourceNodeId ? nds.find((n) => n.id === sourceNodeId) : nds.find((n) => n.id === 'trigger-1');
      if (sourceNode) {
        const newNode: Node = {
          id: `otherwise-${Date.now()}`,
          data: { label: 'Otherwise' },
          position: {
            x: sourceNode.position.x + 200,
            y: sourceNode.position.y,
          },
        };
        
        // Automatically connect source to otherwise
        setEdges((eds: Edge[]) => {
          const newEdge: Edge = {
            id: `edge-${sourceNode.id}-${newNode.id}`,
            source: sourceNode.id,
            target: newNode.id,
            style: { stroke: '#ef4444' }, // Red color to distinguish from normal flow
            label: 'Otherwise',
          };
          return [...eds, newEdge];
        });
        
        return [...nds, newNode];
      }
      return nds;
    });
  }, []);

  const addConditionNode = useCallback((setNodes: any, setEdges: any, sourceNodeId?: string) => {
    setNodes((nds: Node[]) => {
      const sourceNode = sourceNodeId ? nds.find((n) => n.id === sourceNodeId) : nds.find((n) => n.id === 'trigger-1');
      if (sourceNode) {
        const newNodeId = `condition-${Date.now()}`;
        const newNode: Node<ConditionNodeData> = {
          id: newNodeId,
          type: 'condition',
          data: { 
            label: 'Condition',
            onAddAction: () => addActionNode(setNodes, setEdges, newNodeId),
            onAddCondition: () => addConditionNode(setNodes, setEdges, newNodeId),
            onAddOtherwise: () => addOtherwiseNode(setNodes, setEdges, newNodeId),
            onRequestDelete: (id: string, type: 'trigger' | 'condition' | 'action' | 'otherwise') => {
              setDeleteTarget({ id, type });
              setDeleteDialogOpen(true);
            },
          },
          position: {
            x: sourceNode.position.x,
            y: sourceNode.position.y + 150,
          },
        };
        
        // Automatically connect source to condition
        setEdges((eds: Edge[]) => {
          const newEdge: Edge = {
            id: `edge-${sourceNode.id}-${newNode.id}`,
            source: sourceNode.id,
            target: newNode.id,
          };
          return [...eds, newEdge];
        });
        // Make the newly created condition node active so the sidebar opens
        setSelectedNodeId(newNodeId);

        return [...nds, newNode];
      }
      return nds;
    });
  }, [addActionNode, addOtherwiseNode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onAddAction: () => addActionNode(setNodes, setEdges, 'trigger-1'),
        onAddCondition: () => addConditionNode(setNodes, setEdges, 'trigger-1'),
        isTriggerSelected: false,
        canHaveConditions: false,
        onRequestDelete: (id: string, type: 'trigger' | 'condition' | 'action' | 'otherwise') => {
          setDeleteTarget({ id, type });
          setDeleteDialogOpen(true);
        },
      },
    }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { triggers, getAll } = useTriggers();
  React.useEffect(() => {
    getAll().catch(() => {});
  }, [getAll]);

  // Actions context
  const { actions, getAll: getAllActions } = useActions();
  React.useEffect(() => {
    getAllActions().catch(() => {});
  }, [getAllActions]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const { create: createFlow } = useAutomationFlows();
  const { activeStoreId } = useStore();
  const handleSave = useCallback(async (override?: { name: string; description?: string }) => {
    // Build useful pipeline data from current graph
    const triggerNode = nodes.find((n) => n.id === 'trigger-1');
    const triggerName = (triggerNode?.data as any)?.label || 'Trigger';
    const triggerKey = selectedTrigger || null;
    const triggerId = triggerKey ? (triggers.find((t) => t.key === triggerKey)?._id || null) : null;

    const findNextFrom = (sourceId: string | null): string | null => {
      if (!sourceId) return null;
      const edge = edges.find((e) => e.source === sourceId);
      return edge ? edge.target : null;
    };

    const conditions: Array<{ variable?: string; operator?: string; value?: string; description?: string }> = [];
    let cursor: string | null = findNextFrom('trigger-1');
    let lastVisited: string | null = 'trigger-1';
    while (cursor) {
      const node = nodes.find((n) => n.id === cursor);
      if (!node) break;
      if (node.type === 'condition') {
        const d = (node.data as any) || {};
        conditions.push({
          variable: d.variable || undefined,
          operator: d.operator || undefined,
          value: d.value ?? undefined,
          description: d.description || undefined,
        });
        lastVisited = node.id;
        cursor = findNextFrom(node.id);
      } else {
        lastVisited = node.id;
        break;
      }
    }

    let action: { id?: string | null; actionType?: string; name?: string } | null = null;
    const maybeActionNodeId = cursor || lastVisited;
    const maybeActionNode = nodes.find((n) => n.id === maybeActionNodeId);
    if (maybeActionNode && maybeActionNode.type === 'action') {
      const d = (maybeActionNode.data as any) || {};
      const actionId = d.actionType ? (actions.find((a) => a.actionType === d.actionType)?._id || null) : null;
      action = { id: actionId, actionType: d.actionType, name: d.label };
    }

    const serialized = {
      selectedTrigger,
      nodes: nodes.map((n) => ({ id: n.id, type: n.type, position: n.position, data: n.data })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: (e as any).label, style: (e as any).style })),
      mainData: {
        trigger: { id: triggerId, key: triggerKey, name: triggerName },
        conditions,
        action,
      },
    };
    // Persist via context
    try {
      const storeId = activeStoreId || '';
      const defaultName = `${triggerName}${action?.name ? ` → ${action.name}` : ''}`;
      const name = (override?.name || defaultName || 'Untitled automation').trim();
      const description = (override?.description || '').trim();
      await createFlow({
        storeId,
        name,
        description,
        triggerId: (triggerId as string) || '',
        triggerKey: (triggerKey as any) || 'add_to_cart',
        isActive: true,
        flowData: serialized,
      });
      navigate('/marketing/automations');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, [selectedTrigger, nodes, edges, triggers, actions, createFlow, navigate, activeStoreId]);

  const nodeTypes = useMemo(
    () => ({
      trigger: TriggerNode,
      condition: ConditionNode,
    }),
    []
  );

  const edgeOptions = useMemo(
    () => ({
      animated: true,
      style: { stroke: '#6366f1' },
    }),
    []
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    }),
    []
  );

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative' }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: 0,
        }}
      >
        <IconButton onClick={() => navigate('/marketing/automations')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Create automation
        </Typography>
        <Button
          variant="contained"
          size="small"
          sx={{ textTransform: 'none', mr: 1 }}
          onClick={() => {
            // Prefill suggested name from current selection
            const triggerNode = nodes.find((n) => n.id === 'trigger-1');
            const triggerName = (triggerNode?.data as any)?.label || 'Trigger';
            const actionNode = nodes.find((n) => n.type === 'action');
            const actionName = actionNode ? ((actionNode.data as any)?.label || 'Action') : '';
            const suggested = `${triggerName}${actionName ? ` → ${actionName}` : ''}`;
            setFlowName(suggested);
            setFlowDescription('');
            setFlowNameError(null);
            setSaveDialogOpen(true);
          }}
        >
          Save
        </Button>
        
      </Paper>

      {/* React Flow Canvas */}
      <Box sx={{ height: '100%', width: '100%', pt: 8, display: 'flex' }}>
        {/* Main Canvas Area */}
        <Box sx={{ flex: 1, height: '100%' }}>
          <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(event, node) => {
            event.stopPropagation();
            setSelectedNodeId(node.id);
          }}
          onPaneClick={() => {
            setSelectedNodeId(null);
          }}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          attributionPosition="bottom-left"
          connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
          connectionLineType={ConnectionLineType.SmoothStep}
        >
          {/* Grid Background */}
          {/* @ts-ignore - React Flow type compatibility issue with React 19 */}
          <Background
            variant="dots"
            gap={20}
            size={1}
            color="#e0e0e0"
          />
          
          {/* Controls */}
          {/* @ts-ignore */}
          <Controls />
          
          {/* Mini Map */}
          {/* @ts-ignore - React Flow type compatibility issue with React 19 */}
          <MiniMap
            nodeColor={(node: Node) => {
              if (node.type === 'input') return '#6366f1';
              return '#94a3b8';
            }}
            maskColor="rgba(0, 0, 0, 0.05)"
          />
        </ReactFlow>
        </Box>

        {/* Right Sidebar - Condition or Trigger Selection */}
        <Paper
          elevation={2}
          sx={{
            width: 320,
            height: '100%',
            borderRadius: 0,
            borderLeft: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {selectedNodeId && nodes.find((n) => n.id === selectedNodeId && n.type === 'condition') ? (
            // Condition Sidebar
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Condition
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setSelectedNodeId(null)}
                  sx={{ color: 'text.secondary' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Take different actions based on the conditions you set
                  </Typography>
                  <InfoIcon sx={{ color: 'text.secondary', fontSize: 16, mt: 0.25 }} />
                </Box>
              </Box>

              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                {editingDescription ? (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Enter description"
                      value={descriptionDraft}
                      onChange={(e) => setDescriptionDraft(e.target.value)}
                    />
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        setEditingDescription(false);
                        setDescriptionDraft('');
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        if (selectedNodeId) {
                          setNodes((nds) =>
                            nds.map((node) =>
                              node.id === selectedNodeId && node.type === 'condition'
                                ? {
                                    ...node,
                                    data: {
                                      ...node.data,
                                      description: descriptionDraft,
                                    },
                                  }
                                : node
                            )
                          );
                        }
                        setEditingDescription(false);
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      OK
                    </Button>
                  </Box>
                ) : (
                  <>
                    {selectedNodeId && (nodes.find((n) => n.id === selectedNodeId && n.type === 'condition')?.data as any)?.description ? (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ pr: 2 }}>
                          {(nodes.find((n) => n.id === selectedNodeId && n.type === 'condition')?.data as any).description}
                        </Typography>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => {
                            const existing = (nodes.find((n) => n.id === selectedNodeId && n.type === 'condition')?.data as any)?.description || '';
                            setDescriptionDraft(existing);
                            setEditingDescription(true);
                          }}
                          sx={{ color: '#6366f1', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          Edit
                        </Link>
                      </Box>
                    ) : (
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => {
                          setDescriptionDraft('');
                          setEditingDescription(true);
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: '#6366f1',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        <AddIcon sx={{ fontSize: 16 }} />
                        Add description
                      </Link>
                    )}
                  </>
                )}
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  IF
                </Typography>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    mb: 2,
                    justifyContent: 'flex-start',
                    borderColor: '#e0e0e0',
                    color: 'text.secondary',
                    backgroundColor: '#f5f5f5',
                    '&:hover': {
                      borderColor: '#d0d0d0',
                      backgroundColor: '#f0f0f0',
                    },
                  }}
                  onClick={() => setOpenVariableModal(true)}
                >
                  {(nodes.find((n) => n.id === selectedNodeId && n.type === 'condition')?.data as ConditionNodeData)?.variable || 'Add a variable'}
                </Button>

                {(nodes.find((n) => n.id === selectedNodeId && n.type === 'condition')?.data as ConditionNodeData)?.variable ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      backgroundColor: '#fafafa',
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <DuplicateIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Variable
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedVariable}
                      </Typography>
                    </Box>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="operator-label">Operator</InputLabel>
                      <Select
                        labelId="operator-label"
                        label="Operator"
                        value={(nodes.find((n) => n.id === selectedNodeId && n.type === 'condition')?.data as any)?.operator || selectedOperator}
                        onChange={(e) => {
                          const newOperator = e.target.value as string;
                          setSelectedOperator(newOperator);
                          if (selectedNodeId) {
                            setNodes((nds) =>
                              nds.map((node) =>
                                node.id === selectedNodeId && node.type === 'condition'
                                  ? { ...node, data: { ...(node.data as any), operator: newOperator } }
                                  : node
                              )
                            );
                          }
                        }}
                      >
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

                    <TextField
                      fullWidth
                      label="Value"
                      placeholder="Enter value"
                      variant="outlined"
                      value={(nodes.find((n) => n.id === selectedNodeId && n.type === 'condition')?.data as any)?.value || ''}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (selectedNodeId) {
                          setNodes((nds) =>
                            nds.map((node) =>
                              node.id === selectedNodeId && node.type === 'condition'
                                ? { ...node, data: { ...(node.data as any), value: newValue } }
                                : node
                            )
                          );
                        }
                      }}
                    />
                  </Paper>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      backgroundColor: '#fafafa',
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <DuplicateIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="operator-label">Operator</InputLabel>
                      <Select
                        labelId="operator-label"
                        label="Operator"
                        value={(nodes.find((n) => n.id === selectedNodeId && n.type === 'condition')?.data as any)?.operator || selectedOperator}
                        onChange={(e) => {
                          const newOperator = e.target.value as string;
                          setSelectedOperator(newOperator);
                          if (selectedNodeId) {
                            setNodes((nds) =>
                              nds.map((node) =>
                                node.id === selectedNodeId && node.type === 'condition'
                                  ? { ...node, data: { ...(node.data as any), operator: newOperator } }
                                  : node
                              )
                            );
                          }
                        }}
                      >
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

                    <TextField
                      fullWidth
                      label="Value"
                      placeholder="Enter value"
                      variant="outlined"
                      value={(nodes.find((n) => n.id === selectedNodeId && n.type === 'condition')?.data as any)?.value || ''}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (selectedNodeId) {
                          setNodes((nds) =>
                            nds.map((node) =>
                              node.id === selectedNodeId && node.type === 'condition'
                                ? { ...node, data: { ...(node.data as any), value: newValue } }
                                : node
                            )
                          );
                        }
                      }}
                    />
                  </Paper>
                )}
              </Box>
            </>
          ) : selectedNodeId && nodes.find((n) => n.id === selectedNodeId && n.type === 'action') ? (
            // Action Selection Sidebar
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Select action
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Choose what should happen next
                </Typography>
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <List sx={{ p: 0 }}>
                  {actions.map((action) => {
                    const isSelected = (nodes.find((n) => n.id === selectedNodeId)?.data as any)?.actionType === action.actionType;
                    return (
                      <ListItem key={action._id} disablePadding>
                        <ListItemButton
                          selected={isSelected}
                          onClick={() => {
                            if (!selectedNodeId) return;
                            setNodes((nds) =>
                              nds.map((node) =>
                                node.id === selectedNodeId
                                  ? { ...node, data: { ...(node.data as any), label: action.name, actionType: action.actionType } }
                                  : node
                              )
                            );
                          }}
                          sx={{
                            py: 1.5,
                            px: 2,
                            '&.Mui-selected': {
                              backgroundColor: '#f3f4f6',
                              borderLeft: '3px solid #6366f1',
                              '&:hover': { backgroundColor: '#f3f4f6' },
                            },
                          }}
                        >
                          <ListItemText
                            primary={action.name}
                            secondary={action.description}
                            primaryTypographyProps={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? '#6366f1' : 'text.primary' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            </>
          ) : (
            // Trigger Selection Sidebar
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Select trigger
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Choose when this automation starts
                </Typography>
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <List sx={{ p: 0 }}>
                  {triggers.map((trigger) => {
                    const isSelected = selectedTrigger === trigger.key;
                    
                    return (
                      <ListItem key={trigger._id} disablePadding>
                        <ListItemButton
                          selected={isSelected}
                          onClick={() => {
                            setSelectedTrigger(trigger.key);
                            // Update the trigger node label
                            setNodes((nds) =>
                              nds.map((node) =>
                                node.id === 'trigger-1'
                                  ? {
                                      ...node,
                                      data: {
                                        ...node.data,
                                        label: trigger.name,
                                        onAddAction: () => addActionNode(setNodes, setEdges),
                                        onAddCondition: () => addConditionNode(setNodes, setEdges),
                                        isTriggerSelected: true,
                                        canHaveConditions: Boolean(trigger.hasConditions),
                                        onRequestDelete: (id: string, type: 'trigger' | 'condition' | 'action' | 'otherwise') => {
                                          setDeleteTarget({ id, type });
                                          setDeleteDialogOpen(true);
                                        },
                                      },
                                    }
                                  : node
                              )
                            );
                          }}
                          sx={{
                            py: 1.5,
                            px: 2,
                            '&.Mui-selected': {
                              backgroundColor: '#f3f4f6',
                              borderLeft: '3px solid #6366f1',
                              '&:hover': {
                                backgroundColor: '#f3f4f6',
                              },
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <ShoppingCartIcon sx={{ color: isSelected ? '#6366f1' : 'text.secondary' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={trigger.name}
                            secondary={trigger.description}
                            primaryTypographyProps={{
                              fontWeight: isSelected ? 600 : 400,
                              color: isSelected ? '#6366f1' : 'text.primary',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* Delete Node Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete {deleteTarget?.type} node?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Do you really want to delete this {deleteTarget?.type} node?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              if (!deleteTarget) return;
              const hasChildren = edges.some((e) => e.source === deleteTarget.id);
              if (hasChildren) {
                toast.error("Can't delete: this node has child nodes.");
                setDeleteDialogOpen(false);
                return;
              }
              // Remove the node and any incident edges
              setNodes((nds) => nds.filter((n) => n.id !== deleteTarget.id));
              setEdges((eds) => eds.filter((e) => e.source !== deleteTarget.id && e.target !== deleteTarget.id));
              setDeleteDialogOpen(false);
              if (selectedNodeId === deleteTarget.id) setSelectedNodeId(null);
              setDeleteTarget(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Flow Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save automation</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              required
              value={flowName}
              onChange={(e) => {
                setFlowName(e.target.value);
                if (flowNameError) setFlowNameError(null);
              }}
              error={Boolean(flowNameError)}
              helperText={flowNameError || ''}
            />
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!flowName.trim()) {
                setFlowNameError('Name is required');
                return;
              }
              try {
                await handleSave({ name: flowName.trim(), description: flowDescription });
              } finally {
                setSaveDialogOpen(false);
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Variable Modal */}
      <Dialog
        open={openVariableModal}
        onClose={() => setOpenVariableModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add a variable
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="text"
              size="small"
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              Configure sample data
            </Button>
            <IconButton
              size="small"
              onClick={() => setOpenVariableModal(false)}
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by variable name or description"
            value={variableSearchQuery}
            onChange={(e) => setVariableSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Order created
                </Typography>
              </Box>
              <Chip
                label="Trigger"
                size="small"
                sx={{
                  backgroundColor: '#f3f4f6',
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(() => {
              const active = triggers.find((t) => t.key === selectedTrigger);
              const vars = active?.exposedVariables || [];
              const filtered = vars.filter((v) => {
                if (!variableSearchQuery) return true;
                const q = variableSearchQuery.toLowerCase();
                return (
                  v.path.toLowerCase().includes(q) ||
                  v.label.toLowerCase().includes(q) ||
                  (v.description || '').toLowerCase().includes(q)
                );
              });
              if (filtered.length === 0) {
                return (
                  <Typography variant="body2" color="text.secondary">
                    {active ? 'No variables match your search.' : 'Select a trigger to see its variables.'}
                  </Typography>
                );
              }
              return filtered.map((v) => (
                <Paper
                  key={v.path}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f9f9f9',
                      borderColor: '#d0d0d0',
                    },
                  }}
                  onClick={() => {
                    const selectedNode = nodes.find((n) => n.id === selectedNodeId && n.type === 'condition');
                    if (selectedNode) {
                      setSelectedVariable(v.path);
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === selectedNodeId
                            ? {
                                ...node,
                                data: {
                                  ...node.data,
                                  variable: v.path,
                                  operator: selectedOperator,
                                },
                              }
                            : node
                        )
                      );
                    } else {
                      setSelectedVariable(v.path);
                    }
                    setOpenVariableModal(false);
                    setVariableSearchQuery('');
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {v.label} <Typography component="span" variant="caption" color="text.secondary">({v.path})</Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {v.description || ''}
                      </Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: 'text.secondary', ml: 1 }}>
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ));
            })()}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AutomationCreatePage;


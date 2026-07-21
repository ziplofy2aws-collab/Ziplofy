// Redis/BullMQ temporarily disabled for local development.
export function startEmailWorker() {
  return {
    async close() {
      // no-op while Redis is disabled
    },
  };
}



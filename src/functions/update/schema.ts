export default {
  type: "object",
  properties: {
    id: { type: 'number' },
    streamCount: { type: 'number'}
  },
  required: ['id']
} as const;

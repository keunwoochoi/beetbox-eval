export const runDefinitions = [
  { id: 'codex-sol-xhigh', label: 'GPT-5.6 Sol', detail: 'Extra-high reasoning', provider: 'OpenAI', model: 'gpt-5.6-sol', effort: 'xhigh', runner: 'Codex CLI', folder: 'codex-gpt-5.6-sol-xhigh', port: 4101 },
  { id: 'codex-sol-medium', label: 'GPT-5.6 Sol', detail: 'Medium reasoning', provider: 'OpenAI', model: 'gpt-5.6-sol', effort: 'medium', runner: 'Codex CLI', folder: 'codex-gpt-5.6-sol-medium', port: 4102 },
  { id: 'codex-terra-high', label: 'GPT-5.6 Terra', detail: 'High reasoning', provider: 'OpenAI', model: 'gpt-5.6-terra', effort: 'high', runner: 'Codex CLI', folder: 'codex-gpt-5.6-terra-high', port: 4103 },
  { id: 'codex-luna-high', label: 'GPT-5.6 Luna', detail: 'High reasoning', provider: 'OpenAI', model: 'gpt-5.6-luna', effort: 'high', runner: 'Codex CLI', folder: 'codex-gpt-5.6-luna-high', port: 4104 },
  { id: 'claude-fable-xhigh', label: 'Claude Fable 5', detail: 'Extra-high effort', provider: 'Anthropic', model: 'claude-fable-5', effort: 'xhigh', runner: 'Claude Code', folder: 'claude-code-fable-5-xhigh', port: 4111 },
  { id: 'claude-opus-xhigh', label: 'Claude Opus 4.8', detail: 'Extra-high effort', provider: 'Anthropic', model: 'claude-opus-4-8', effort: 'xhigh', runner: 'Claude Code', folder: 'claude-code-opus-4.8-xhigh', port: 4112 },
  { id: 'claude-sonnet-high', label: 'Claude Sonnet 5', detail: 'High effort', provider: 'Anthropic', model: 'claude-sonnet-5', effort: 'high', runner: 'Claude Code', folder: 'claude-code-sonnet-5-high', port: 4113 },
  { id: 'claude-haiku', label: 'Claude Haiku 4.5', detail: 'Default effort', provider: 'Anthropic', model: 'claude-haiku-4-5', effort: 'default', runner: 'Claude Code', folder: 'claude-code-haiku-4.5', port: 4114 },
  { id: 'minimax-m3', label: 'MiniMax M3', detail: 'Default effort', provider: 'MiniMax', model: 'minimax-m3', effort: 'default', runner: 'OpenCode', folder: 'opencode-minimax-m3', port: 4131 },
  { id: 'legacy-gpt', label: 'GPT baseline', detail: 'Generic subagent run', provider: 'OpenAI', model: 'unverified', effort: 'unverified', runner: 'Generic subagent', folder: 'gpt-5.6-sol-xhigh', port: 4121 },
  { id: 'legacy-claude', label: 'Claude baseline', detail: 'Generic subagent run', provider: 'Anthropic', model: 'unverified', effort: 'unverified', runner: 'Generic subagent', folder: 'claude-fable-5.0', port: 4122 }
];

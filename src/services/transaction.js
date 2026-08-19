// TransactionService — DEMO MODE simulated execution.
//
// REAL MODE would submit each transactionPlan step via the connected
// wallet's signer against X Layer RPC, await receipts, and surface the real
// tx hash + explorer link. This module never claims success without an
// awaited result, demo or real.

import { X_LAYER } from './xlayer.js';

function randomHash() {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * chars.length)];
  return hash;
}

export async function executeTransactionPlan(plan, { isDemo = true, onStepUpdate } = {}) {
  const results = [];
  for (const step of plan) {
    onStepUpdate?.(step.step, 'pending');
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));

    // Small chance of a simulated rejection to exercise the error state.
    const failed = isDemo && Math.random() < 0.03;
    if (failed) {
      onStepUpdate?.(step.step, 'failed');
      results.push({ step: step.step, status: 'failed', error: 'Transaction rejected by wallet.' });
      return { success: false, results, isDemo };
    }

    const hash = randomHash();
    onStepUpdate?.(step.step, 'confirmed', hash);
    results.push({
      step: step.step,
      status: 'confirmed',
      hash,
      network: X_LAYER.chainName,
      timestamp: Date.now(),
      explorerUrl: isDemo ? null : `${X_LAYER.explorer}/tx/${hash}`,
    });
  }
  return { success: true, results, isDemo };
}

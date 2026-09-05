// SPDX-License-Identifier: MIT
/**
 * Structured dialogue (D-SIM-001): authored question menus with tracked cost and order. A
 * node can be asked once, when it is an entry node or an earlier answer unlocked it; asking
 * spends its cost, reveals the claims its response carries, and unlocks its follow-ups.
 */
import type { HandlerContext } from './context.ts';
import { reveal } from './context.ts';
import { fail, ok, type Result } from './errors.ts';
import { isSourceOpened, nodeKey, type SessionState } from './state.ts';

export function isNodeAvailable(
  state: SessionState,
  treeId: string,
  nodeId: string,
  entry: boolean,
) {
  return entry || state.unlocked.includes(nodeKey(treeId, nodeId));
}

export function isNodeAsked(state: SessionState, treeId: string, nodeId: string): boolean {
  return state.asked.some((a) => a.treeId === treeId && a.nodeId === nodeId);
}

export function ask(
  ctx: HandlerContext,
  state: SessionState,
  treeId: string,
  nodeId: string,
): Result<SessionState> {
  const indexed = ctx.index.nodes.get(nodeKey(treeId, nodeId));
  if (indexed === undefined)
    return fail('unknown-dialogue-node', `no node ${nodeId} in tree ${treeId}`, {
      treeId,
      nodeId,
    });
  const { tree, node } = indexed;
  if (!isSourceOpened(state, tree.sourceId))
    return fail('source-not-opened', `open ${tree.sourceId} before asking ${nodeId}`, {
      treeId,
      nodeId,
      sourceId: tree.sourceId,
    });
  if (!isNodeAvailable(state, treeId, nodeId, node.entry))
    return fail('dialogue-node-locked', `${nodeId} has not been unlocked`, { treeId, nodeId });
  if (isNodeAsked(state, treeId, nodeId))
    return fail('dialogue-node-already-asked', `${nodeId} was already asked`, {
      treeId,
      nodeId,
    });
  let s = ctx.advance(state, node.costMinutes);
  const at = s.clock.minutesSinceT0;
  const unlocked = [...s.unlocked];
  for (const follow of node.unlocks) {
    const key = nodeKey(treeId, follow);
    if (ctx.index.nodes.has(key) && !unlocked.includes(key)) unlocked.push(key);
  }
  s = { ...s, asked: [...s.asked, { treeId, nodeId, atMinutes: at }], unlocked };
  s = reveal(s, node.revealsClaimIds, node.revealsAllergyClaimIds, at, {
    kind: 'dialogue-node',
    treeId,
    nodeId,
  });
  return ok(s);
}

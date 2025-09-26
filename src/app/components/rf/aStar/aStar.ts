// Based on https://github.com/qiao/PathFinding.js


import {DiagonalMovement} from "@/app/components/rf/aStar/types";
import {Grid, GridNode} from "@/app/components/rf/aStar/grid";

export interface AStarOptions {
  diagonalMovement?: DiagonalMovement;
  heuristic?: (dx: number, dy: number) => number;
  weight?: number;
}

const manhattan = (dx: number, dy: number): number => dx + dy;

const octile = (dx: number, dy: number): number => {
  const F = Math.SQRT2 - 1;
  return dx < dy ? F * dx + dy : F * dy + dx;
};

const reconstructPath = (endNode: GridNode): number[][] => {
  const path: number[][] = [];
  let node: GridNode | undefined = endNode;

  while (node) {
    path.push([node.x, node.y]);
    node = node.parent;
  }

  return path.reverse();
};

const getHeuristic = (
  diagonalMovement: DiagonalMovement,
): ((dx: number, dy: number) => number) => {
  if (diagonalMovement === "Never") return octile;
  return manhattan;
};

const selectNodeWithLowestEstimatedTotalCost = (
  openList: GridNode[],
): GridNode => {
  let bestIdx = 0;

  for (let i = 1; i < openList.length; i++) {
    if (
      (openList[i].estimatedTotalCost ?? Infinity) <
      (openList[bestIdx].estimatedTotalCost ?? Infinity)
    ) {
      bestIdx = i;
    }
  }

  return openList.splice(bestIdx, 1)[0];
};

const processNeighbor = (
  neighbor: GridNode,
  current: GridNode,
  end: GridNode,
  openList: GridNode[],
  heuristic: (dx: number, dy: number) => number,
  weight: number,
): void => {
  if (neighbor.closed) return;

  const dx = Math.abs(neighbor.x - current.x);
  const dy = Math.abs(neighbor.y - current.y);

  const tentativeG =
    (current.costFromStart ?? 0) + (dx === 0 || dy === 0 ? 1 : Math.SQRT2);

  if (!neighbor.opened || tentativeG < (neighbor.costFromStart ?? Infinity)) {
    neighbor.costFromStart = tentativeG;

    neighbor.heuristicCostToGoal =
      neighbor.heuristicCostToGoal ??
      weight *
        heuristic(Math.abs(neighbor.x - end.x), Math.abs(neighbor.y - end.y));

    neighbor.estimatedTotalCost =
      (neighbor.costFromStart ?? 0) + (neighbor.heuristicCostToGoal ?? 0);

    neighbor.parent = current;

    if (!neighbor.opened) {
      neighbor.opened = true;
      openList.push(neighbor);
    }
  }
};

export const createAStarFinder = (opts: AStarOptions = {}) => {
  const diagonalMovement: DiagonalMovement = opts.diagonalMovement ?? "Never";
  const heuristic = opts.heuristic ?? getHeuristic(diagonalMovement);
  const weight = opts.weight ?? 1;

  const findPath = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    grid: Grid,
  ): number[][] => {
    const start = grid.getNodeAt(startX, startY);
    const end = grid.getNodeAt(endX, endY);

    // Open list implemented as a simple array with linear min search for clarity
    const openList: GridNode[] = [];

    start.costFromStart = 0;
    start.heuristicCostToGoal = 0;
    start.estimatedTotalCost = 0;
    start.opened = true;
    openList.push(start);

    while (openList.length > 0) {
      const node = selectNodeWithLowestEstimatedTotalCost(openList);
      node.closed = true;

      if (node === end) {
        return reconstructPath(end);
      }

      const neighbors = grid.getNeighbors(node, diagonalMovement);
      for (const neighbor of neighbors) {
        processNeighbor(neighbor, node, end, openList, heuristic, weight);
      }
    }

    // no path found
    return [];
  };

  return { findPath };
};

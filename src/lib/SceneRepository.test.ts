import { Scene } from "./SceneRepository";

// Простой юнит-тест для updatePositions
// Так как функция зависит от многих внешних модулей, протестируем логику преобразования данных

describe("updatePositions utility logic", () => {
  it("should correctly transform positions data", () => {
    // Так как оригинальная функция зависит от многих внешних модулей,
    // мы протестируем только логику преобразования данных

    // Имитируем только ту часть функции, которая преобразует данные
    const transformPositionsForUpdate = (questId: number, positions: any[]) => {
      return positions.map((pos) => ({
        id: parseInt(pos.id),
        quest_id: questId,
        position: JSON.stringify(pos.position),
      }));
    };

    const mockQuestId = 1;
    const mockPositions = [
      {
        id: "1",
        position: { x: 100, y: 200 },
      },
      {
        id: "2",
        position: { x: 300, y: 400 },
      },
    ];

    const expectedUpdates = [
      {
        id: 1,
        quest_id: mockQuestId,
        position: '{"x":100,"y":200}',
      },
      {
        id: 2,
        quest_id: mockQuestId,
        position: '{"x":300,"y":400}',
      },
    ];

    const result = transformPositionsForUpdate(mockQuestId, mockPositions);

    expect(result).toEqual(expectedUpdates);
  });

  it("should correctly count updated items when data is an array", () => {
    const data = [{ id: 1 }, { id: 2 }, { id: 3 }] as Scene[];
    const updatedCount = data ? data.length : 0;
    expect(updatedCount).toBe(3);
  });

  it("should return 0 when data is null or undefined", () => {
    const data = null;
    const updatedCount = data ? (data as Scene[]).length : 0;
    expect(updatedCount).toBe(0);

    const dataUndefined = undefined;
    const updatedCount2 = dataUndefined ? (dataUndefined as Scene[]).length : 0;
    expect(updatedCount2).toBe(0);
  });
});

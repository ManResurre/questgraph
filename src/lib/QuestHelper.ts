import { Quest } from "./QuestRepository";

/**
 * Создает функцию сравнения для сортировки квестов
 * Квесты текущего пользователя будут отображаться в начале списка
 * @param user - объект пользователя или null
 * @returns функция сравнения для Array.sort()
 */
export const createQuestCompareFunction = (user: { id: string } | null) => {
  return (a: Quest, b: Quest) => {
    if (user) {
      const aIsCurrentUser = a.user_id === user.id;
      const bIsCurrentUser = b.user_id === user.id;

      if (aIsCurrentUser && !bIsCurrentUser) {
        return -1;
      }
      if (!aIsCurrentUser && bIsCurrentUser) {
        return 1;
      }
    }
    return a.name.localeCompare(b.name);
  };
};

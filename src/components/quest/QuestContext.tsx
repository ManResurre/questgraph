import {createContext, useContext, ReactNode, useState, useMemo} from 'react'
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {getQuests, upsertQuest, deleteQuest, Quest, QuestInsert} from '@/lib/QuestRepository'

interface QuestContextType {
    quests: Quest[]
    editingQuest: Quest | null
    isLoading: boolean
    upsertQuest: (quest: Quest | QuestInsert) => Promise<void>
    editQuest: (quest: Quest | null) => void
    deleteQuest: (id: number) => Promise<null>
    refetchQuests: () => void
}

const QuestContext = createContext<QuestContextType | undefined>(undefined)

export function useQuestMutations() {
    const queryClient = useQueryClient();
    const upsertMutation = useMutation({
        mutationFn: upsertQuest,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['quests']})
        },
    })

    const deleteMutation = useMutation({
        mutationFn: deleteQuest,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['quests']})
        },
    })

    return useMemo(() => ({
        upsertMutation,
        deleteMutation
    }), [])
}

export function QuestProvider({children}: { children: ReactNode }) {

    const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
    const {
        upsertMutation,
        deleteMutation,
    } = useQuestMutations();

    const {
        data: quests = [],
        isLoading,
        refetch
    } = useQuery({
        queryKey: ['quests'],
        queryFn: getQuests,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    })


    const value = useMemo(() => ({
        quests,
        editingQuest,
        isLoading,
        editQuest: setEditingQuest,
        upsertQuest: upsertMutation.mutateAsync,
        deleteQuest: deleteMutation.mutateAsync,
        refetchQuests: refetch
    }), [quests, isLoading, editingQuest])

    return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>
}

export function useQuests() {
    const context = useContext(QuestContext)
    if (context === undefined) {
        throw new Error('useQuests must be used within a QuestProvider')
    }
    return context
}

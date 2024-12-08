export type Source = {
    file_path: string;
    docId: string;
    // source
    page: string;
    score: number;
    text: string;
    keywords: string[];
};

export type Question = {
    id: string;
    question: string;
    answer: string;
    isLoading: boolean;
    sources: Source[] | null;
};

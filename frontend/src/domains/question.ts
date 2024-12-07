export type Source = {
    file_path: string;
    docID: string;
};

export type Question = {
    id: string;
    question: string;
    answer: string;
    isLoading: boolean;
    sources: Source[] | null;
};

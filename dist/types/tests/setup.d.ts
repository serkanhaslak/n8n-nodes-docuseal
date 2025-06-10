export {};
declare global {
    interface Matchers<R> {
        toBeValidEmail(): R;
        toBeValidUrl(): R;
        toBeValidApiResponse(): R;
        toHaveValidStructure(expected: object): R;
    }
}
declare global {
    const testUtils: {
        createWorkflowContext: () => any;
        createApiCredentials: () => any;
        createMockTemplate: (overrides?: object) => any;
        createMockSubmission: (overrides?: object) => any;
        createMockSubmitter: (overrides?: object) => any;
        createApiResponse: <T>(data: T, status?: number) => any;
        createApiError: (message: string, status?: number) => any;
        wait: (ms: number) => Promise<void>;
        random: {
            email: () => string;
            string: (length?: number) => string;
            number: (min?: number, max?: number) => number;
            boolean: () => boolean;
            date: () => string;
        };
    };
}
//# sourceMappingURL=setup.d.ts.map
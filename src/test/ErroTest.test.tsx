import { describe, it, expect } from 'vitest';

describe('ErroTest', () => {
    it('deve passar por padrão e falhar apenas se configurado', () => {
        const simularErro = false;

        if (simularErro) {
            expect(true).toBe(false); // Vai falhar
        } else {
            expect(true).toBe(true); // Vai passar
        }
    });
});

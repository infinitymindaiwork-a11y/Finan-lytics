import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisData, Transaction } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove "data:application/pdf;base64," prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const analyzeFinancialStatement = async (file: File): Promise<AnalysisData> => {
    const apiKey = import.meta.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY não está configurado nas variáveis de ambiente");
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Pdf = await fileToBase64(file);

    const pdfPart = {
        inlineData: {
            mimeType: 'application/pdf',
            data: base64Pdf,
        },
    };

    const textPart = {
        text: `Analise este extrato bancário do Banco Inter e extraia TODAS as transações. Seja MUITO claro e objetivo:

IMPORTANTE - SALDO TOTAL:
- Procure no cabeçalho do extrato o campo "Saldo total" (geralmente após "Saldo disponível" e "Saldo bloqueado")
- Use EXATAMENTE esse valor como "totalBalance"
- Exemplo: Se aparecer "Saldo total: R$ 50.998,05" então totalBalance = 50998.05

REGRAS DE CATEGORIZAÇÃO:
1. RECEBI (entradas): Salário, transferências recebidas, Pix recebido, "Transferencia recebida", RESGATES de investimento = categoria "Renda", type "income", valor POSITIVO
2. INVESTI (aplicações): Apenas "Aplicacao" em investimentos = categoria "Investimentos", type "expense", valor NEGATIVO
3. GASTEI (despesas): Tudo que NÃO seja renda nem investimento = categorias de gastos, type "expense", valor NEGATIVO

CATEGORIAS PERMITIDAS:
- Renda (salário, transferências recebidas, Pix recebido, RESGATES)
- Investimentos (APENAS aplicações, nunca resgates)
- Alimentação (restaurantes, delivery, iFood)
- Supermercado
- Transporte (combustível, Uber, ônibus)
- Contas (água, luz, internet, telefone, "Debito automatico", pagamentos de fatura)
- Compras (roupas, eletrônicos, etc)
- Saúde (farmácia, médico)
- Casa (aluguel, manutenção)
- Lazer (cinema, viagens)
- Serviços (cabeleireiro, mecânico)
- Transferências (Pix enviado, transferências enviadas)
- Impostos
- Outros

CÁLCULO DO RESUMO (último mês completo no extrato):
- totalBalance = Pegue o "Saldo total" que aparece no cabeçalho do extrato
- monthlyIncome = SOMA de TUDO que entrou no mês (salário + transferências recebidas + resgates + pix recebido)
- monthlyExpenses = SOMA de TODOS os gastos no mês (exceto investimentos)
- monthlyInvestments = SOMA de APENAS as aplicações no mês
- netSavings = monthlyIncome - monthlyExpenses - monthlyInvestments

IMPORTANTE: 
- Um "Resgate" é dinheiro voltando para sua conta = RENDA, não é investimento!
- "Transferencia recebida" = RENDA (entrada)
- "Pix recebido" = RENDA (entrada)
- "Pix enviado" = Transferências (saída)

Retorne no formato JSON especificado. Data: 'DD de Mes de AAAA' (ex: '10 de Novembro de 2025').`,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, pdfPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: {
                        type: Type.OBJECT,
                        properties: {
                            totalBalance: { type: Type.NUMBER, description: "Saldo total da conta que aparece no cabeçalho do extrato (campo 'Saldo total'). Use o valor exato que aparece lá." },
                            monthlyIncome: { type: Type.NUMBER, description: "Total de TUDO que entrou no mês (salário + transferências recebidas + pix recebido + resgates). Valor positivo." },
                            monthlyExpenses: { type: Type.NUMBER, description: "Total de GASTOS no mês (exceto investimentos). Valor absoluto positivo." },
                            monthlyInvestments: { type: Type.NUMBER, description: "Total de APLICAÇÕES no mês (apenas quando você investe dinheiro). Valor absoluto positivo. NÃO incluir resgates." },
                            netSavings: { type: Type.NUMBER, description: "Sobrou no mês = monthlyIncome - monthlyExpenses - monthlyInvestments." },
                        },
                    },
                    transactions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                date: { type: Type.STRING, description: "Data da transação no formato 'DD de Mes de AAAA' (ex: '10 de Novembro de 2025')." },
                                description: { type: Type.STRING, description: "Descrição da transação." },
                                category: { type: Type.STRING, description: "Categoria da transação (Renda, Investimentos, Alimentação, Supermercado, Transporte, Contas, Compras, Saúde, Casa, Lazer, Serviços, Transferências, Impostos, Outros)." },
                                amount: { type: Type.NUMBER, description: "Valor POSITIVO para entradas (renda, resgates). Valor NEGATIVO para saídas (gastos, aplicações)." },
                                type: { type: Type.STRING, description: "'income' para entradas de dinheiro. 'expense' para saídas de dinheiro." },
                            },
                        },
                    },
                    spendingBreakdown: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                category: { type: Type.STRING, description: "Categoria do gasto." },
                                amount: { type: Type.NUMBER, description: "Total gasto nesta categoria (valor absoluto positivo)." },
                            },
                        },
                    },
                    monthlyOverview: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                month: { type: Type.STRING, description: "Nome do mês abreviado com 3 letras (ex: 'Nov', 'Out', 'Set')." },
                                income: { type: Type.NUMBER, description: "Total recebido no mês (incluindo resgates)." },
                                expense: { type: Type.NUMBER, description: "Total de gastos no mês (exceto investimentos)." },
                                investments: { type: Type.NUMBER, description: "Total de aplicações no mês (apenas quando investe, não resgates)." },
                            },
                        },
                    },
                },
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        const parsedData: Omit<AnalysisData, 'transactions'> & { transactions: Omit<Transaction, 'id'>[] } = JSON.parse(jsonText);
        
        // Add unique IDs to each transaction
        const transactionsWithIds: Transaction[] = parsedData.transactions.map((tx, index) => ({
            ...tx,
            id: `gemini-${Date.now()}-${index}`
        }));

        const finalData: AnalysisData = {
            ...parsedData,
            transactions: transactionsWithIds
        };

        // Helper to parse Brazilian Portuguese dates
        const parsePtBrDate = (dateString: string): Date => {
            const months: { [key: string]: number } = {
                'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
                'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
            };
            const parts = dateString.toLowerCase().split(' de ');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = months[parts[1]];
                const year = parseInt(parts[2], 10);
                if (!isNaN(day) && month !== undefined && !isNaN(year)) {
                    return new Date(year, month, day);
                }
            }
            return new Date(dateString); // Fallback
        };

        // Sort transactions by date descending
        finalData.transactions.sort((a, b) => {
            const dateA = parsePtBrDate(a.date).getTime();
            const dateB = parsePtBrDate(b.date).getTime();
            return dateB - dateA;
        });

        return finalData;
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("Could not parse the financial data from the model.");
    }
};
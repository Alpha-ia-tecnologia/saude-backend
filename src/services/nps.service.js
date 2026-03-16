// NPS Survey Service - Net Promoter Score methodology
// Score 0-10: 0-6 = Detractor, 7-8 = Passive, 9-10 = Promoter
// NPS = %Promoters - %Detractors
// Refactored to use Prisma instead of in-memory arrays

import prisma from '../lib/prisma.js';

const categories = [
    'Atendimento Medico',
    'Enfermagem',
    'Recepcao',
    'Farmacia',
    'Estrutura Fisica',
    'Tempo de Espera'
];

function classifyScore(score) {
    if (score >= 9) return 'promoter';
    if (score >= 7) return 'passive';
    return 'detractor';
}

function calculateNPS(surveyList) {
    if (surveyList.length === 0) return { nps: 0, promoters: 0, passives: 0, detractors: 0, total: 0 };

    let promoters = 0;
    let passives = 0;
    let detractors = 0;

    surveyList.forEach(s => {
        const type = classifyScore(s.score);
        if (type === 'promoter') promoters++;
        else if (type === 'passive') passives++;
        else detractors++;
    });

    const total = surveyList.length;
    const nps = Math.round(((promoters / total) - (detractors / total)) * 100);

    return {
        nps,
        promoters,
        passives,
        detractors,
        total,
        promoterPercent: Math.round((promoters / total) * 100),
        passivePercent: Math.round((passives / total) * 100),
        detractorPercent: Math.round((detractors / total) * 100)
    };
}

const npsService = {
    async submitSurvey(data) {
        const score = parseInt(data.score);
        const survey = await prisma.npsSurvey.create({
            data: {
                pacienteNome: data.pacienteNome || 'Anonimo',
                score,
                category: data.category,
                comment: data.comment || '',
                date: new Date().toISOString().split('T')[0]
            }
        });

        return {
            id: survey.id,
            pacienteNome: survey.pacienteNome,
            score: survey.score,
            category: survey.category,
            comment: survey.comment,
            date: survey.date,
            createdAt: survey.createdAt.toISOString()
        };
    },

    async getSurveys(filters = {}) {
        const where = {};

        if (filters.category) {
            where.category = filters.category;
        }
        if (filters.startDate) {
            where.date = { ...(where.date || {}), gte: filters.startDate };
        }
        if (filters.endDate) {
            where.date = { ...(where.date || {}), lte: filters.endDate };
        }
        // classification filter requires post-filtering since it derives from score
        if (filters.classification) {
            if (filters.classification === 'promoter') {
                where.score = { gte: 9 };
            } else if (filters.classification === 'passive') {
                where.score = { gte: 7, lt: 9 };
            } else if (filters.classification === 'detractor') {
                where.score = { lt: 7 };
            }
        }

        const surveys = await prisma.npsSurvey.findMany({
            where,
            orderBy: { date: 'desc' }
        });

        return surveys.map(s => ({
            id: s.id,
            pacienteNome: s.pacienteNome,
            score: s.score,
            category: s.category,
            comment: s.comment,
            date: s.date,
            createdAt: s.createdAt.toISOString(),
            classification: classifyScore(s.score)
        }));
    },

    async getNPSScore() {
        const surveys = await prisma.npsSurvey.findMany();
        return calculateNPS(surveys);
    },

    async getNPSTrend() {
        const surveys = await prisma.npsSurvey.findMany();

        const months = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();

            // Build YYYY-MM prefix for string-based date comparison
            const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;

            const monthSurveys = surveys.filter(s => s.date.startsWith(prefix));

            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const npsData = calculateNPS(monthSurveys);

            months.push({
                month: monthNames[month],
                year,
                label: `${monthNames[month]}/${year}`,
                ...npsData
            });
        }

        return months;
    },

    async getSurveysByPeriod(startDate, endDate) {
        const where = {};
        if (startDate) where.date = { ...(where.date || {}), gte: startDate };
        if (endDate) where.date = { ...(where.date || {}), lte: endDate };

        const filtered = await prisma.npsSurvey.findMany({ where });
        return calculateNPS(filtered);
    },

    async getNPSByCategory() {
        const surveys = await prisma.npsSurvey.findMany();

        return categories.map(cat => {
            const catSurveys = surveys.filter(s => s.category === cat);
            const npsData = calculateNPS(catSurveys);
            return {
                category: cat,
                ...npsData
            };
        });
    },

    getCategories() {
        return categories;
    }
};

export default npsService;

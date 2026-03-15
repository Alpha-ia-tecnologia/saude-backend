// NPS Survey Service - Net Promoter Score methodology
// Score 0-10: 0-6 = Detractor, 7-8 = Passive, 9-10 = Promoter
// NPS = %Promoters - %Detractors

const categories = [
    'Atendimento Medico',
    'Enfermagem',
    'Recepcao',
    'Farmacia',
    'Estrutura Fisica',
    'Tempo de Espera'
];

// Generate sample survey data
function generateSampleData() {
    const surveys = [];
    const comments = {
        promoter: [
            'Excelente atendimento, equipe muito atenciosa e competente.',
            'Fui muito bem atendido, superou minhas expectativas.',
            'Profissionais dedicados e estrutura de qualidade.',
            'Recomendo a todos, servico de excelencia.',
            'Rapido, eficiente e humanizado. Nota 10!',
            'Atendimento impecavel, me senti muito acolhido.',
            'Equipe muito profissional e ambiente agradavel.',
            'Otima experiencia, desde a recepcao ate a consulta.',
            'Medico muito atencioso, explicou tudo com paciencia.',
            'Servico de primeira qualidade, voltarei com certeza.'
        ],
        passive: [
            'Atendimento bom, mas poderia melhorar o tempo de espera.',
            'Razoavel, nada de especial. Cumpriu o esperado.',
            'Bom atendimento, mas a estrutura precisa de melhorias.',
            'Nao tenho reclamacoes, mas tambem nada excepcional.',
            'Atendimento adequado, porem um pouco demorado.',
            'Profissionais competentes, mas faltou um pouco de empatia.',
            'Servico ok, mas achei a espera um pouco longa.'
        ],
        detractor: [
            'Esperei mais de 2 horas para ser atendido.',
            'Atendimento frio e impessoal, sem empatia.',
            'Estrutura precaria, faltam equipamentos basicos.',
            'Pessimo atendimento na recepcao, muita grosseria.',
            'Nao recomendo, experiencia muito negativa.',
            'Demora excessiva e falta de organizacao.',
            'Profissionais parecem sobrecarregados e desatentos.',
            'Faltou medicamento na farmacia, tive que comprar fora.'
        ]
    };

    const names = [
        'Ana Silva', 'Carlos Oliveira', 'Maria Santos', 'Joao Pereira',
        'Fernanda Costa', 'Pedro Almeida', 'Juliana Lima', 'Rafael Souza',
        'Patricia Ferreira', 'Lucas Rodrigues', 'Beatriz Martins', 'Gabriel Araujo',
        'Camila Barbosa', 'Thiago Ribeiro', 'Larissa Goncalves', 'Mateus Carvalho',
        'Amanda Nascimento', 'Diego Mendes', 'Isabela Rocha', 'Vinicius Castro',
        'Mariana Moreira', 'Bruno Alves', 'Leticia Cardoso', 'Felipe Nunes',
        'Daniela Correia', 'Gustavo Pinto', 'Aline Teixeira', 'Henrique Monteiro',
        'Renata Vieira', 'Eduardo Freitas', 'Natalia Duarte', 'Roberto Cunha'
    ];

    // Generate 60 surveys spread over the last 12 months
    for (let i = 0; i < 60; i++) {
        const monthsAgo = Math.floor(Math.random() * 12);
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);
        date.setDate(Math.floor(Math.random() * 28) + 1);

        const score = Math.floor(Math.random() * 11); // 0-10
        const category = categories[Math.floor(Math.random() * categories.length)];

        let commentList;
        if (score >= 9) commentList = comments.promoter;
        else if (score >= 7) commentList = comments.passive;
        else commentList = comments.detractor;

        const comment = commentList[Math.floor(Math.random() * commentList.length)];
        const name = names[Math.floor(Math.random() * names.length)];

        surveys.push({
            id: i + 1,
            pacienteNome: name,
            score,
            category,
            comment,
            date: date.toISOString().split('T')[0],
            createdAt: date.toISOString()
        });
    }

    // Sort by date descending
    surveys.sort((a, b) => new Date(b.date) - new Date(a.date));
    return surveys;
}

let surveys = generateSampleData();
let nextId = surveys.length + 1;

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
    submitSurvey(data) {
        const survey = {
            id: nextId++,
            pacienteNome: data.pacienteNome || 'Anonimo',
            score: parseInt(data.score),
            category: data.category,
            comment: data.comment || '',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        surveys.unshift(survey);
        return survey;
    },

    getSurveys(filters = {}) {
        let result = [...surveys];

        if (filters.category) {
            result = result.filter(s => s.category === filters.category);
        }
        if (filters.classification) {
            result = result.filter(s => classifyScore(s.score) === filters.classification);
        }
        if (filters.startDate) {
            result = result.filter(s => s.date >= filters.startDate);
        }
        if (filters.endDate) {
            result = result.filter(s => s.date <= filters.endDate);
        }

        return result.map(s => ({
            ...s,
            classification: classifyScore(s.score)
        }));
    },

    getNPSScore() {
        return calculateNPS(surveys);
    },

    getNPSTrend() {
        const months = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();

            const monthSurveys = surveys.filter(s => {
                const d = new Date(s.date);
                return d.getFullYear() === year && d.getMonth() === month;
            });

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

    getSurveysByPeriod(startDate, endDate) {
        const filtered = surveys.filter(s => {
            if (startDate && s.date < startDate) return false;
            if (endDate && s.date > endDate) return false;
            return true;
        });
        return calculateNPS(filtered);
    },

    getNPSByCategory() {
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

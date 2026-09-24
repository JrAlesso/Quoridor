
    // ============================================================
    // FIREBASE INIT
    // ============================================================
    const firebaseConfig = {
      apiKey: "AIzaSyBJJZtzkaUoP0swjNrN6Rt0Qm-trzsw4lM",
      authDomain: "quoridor-online-2823d.firebaseapp.com",
      databaseURL: "https://quoridor-online-2823d-default-rtdb.firebaseio.com",
      projectId: "quoridor-online-2823d",
      storageBucket: "quoridor-online-2823d.firebasestorage.app",
      messagingSenderId: "652289533045",
      appId: "1:652289533045:web:043558b29f02c51256443c"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    try { db.settings({ experimentalForceLongPolling: true, merge: true }); } catch(e) {}

    // ============================================================
    // SISTEMA DE CONTAS + RANQUE + HISTÓRICO
    // ============================================================
    var ACCOUNTS_KEY = 'quoridor_accounts_v2';
    var currentUser = null;
var deviceId = null;
var SESSION_TIMEOUT = 60 * 60 * 1000; // 60 min

    // ============================================================
    // SKINS PRÉ-DEFINIDAS
    // ============================================================
    var SKINS = [
      { id: 'classic', nome: 'Clássico', forma: 'circle', cor1: '#d4a373', cor2: '#b8860b', preco: 0, categoria: 'simples' },
      { id: 'blue', nome: 'Azul Real', forma: 'circle', cor1: '#4dabf7', cor2: '#1a6bb5', preco: 100, categoria: 'simples' },
      { id: 'gold', nome: 'Dourado', forma: 'diamond', cor1: '#facc15', cor2: '#b8860b', preco: 250, categoria: 'simples' },
      { id: 'emerald', nome: 'Esmeralda', forma: 'hexagon', cor1: '#10b981', cor2: '#065f46', preco: 400, categoria: 'simples' },
      { id: 'ruby', nome: 'Rubi', forma: 'star', cor1: '#ef4444', cor2: '#7f1d1d', preco: 600, categoria: 'simples' },
      { id: 'neon', nome: 'Neon', forma: 'square', cor1: '#22d3ee', cor2: '#0e7490', preco: 800, categoria: 'simples' },
      // Lendárias
      { id: 'phoenix', nome: 'Fênix Lendária', forma: 'star', cor1: '#ff4500', cor2: '#ffd700', preco: 5000, raridade: 'lendaria', efeito: 'fire', categoria: 'lendarias' },
      { id: 'dragon', nome: 'Dragão Ancestral', forma: 'dragon', cor1: '#8b0000', cor2: '#ff4500', preco: 5000, raridade: 'lendaria', efeito: 'dragon', categoria: 'lendarias' },
      { id: 'blackhole', nome: 'Buraco Negro', forma: 'circle', cor1: '#0a0a12', cor2: '#1a0033', preco: 5000, raridade: 'lendaria', efeito: 'blackhole', categoria: 'lendarias' },
      { id: 'thunder', nome: 'Raio Celestial', forma: 'diamond', cor1: '#00bfff', cor2: '#00008b', preco: 5000, raridade: 'lendaria', efeito: 'electric', categoria: 'lendarias' },
      { id: 'crystal', nome: 'Cristal Arcano', forma: 'square', cor1: '#e0ffff', cor2: '#9400d3', preco: 5000, raridade: 'lendaria', efeito: 'crystal', categoria: 'lendarias' },
      { id: 'nebula', nome: 'Nebulosa', forma: 'circle', cor1: '#8a2be2', cor2: '#ff69b4', preco: 5000, raridade: 'lendaria', efeito: 'nebula', categoria: 'lendarias' },
      { id: 'thunderstorm', nome: 'Trovão e Relâmpago', forma: 'circle', cor1: '#ffff00', cor2: '#808080', preco: 5000, raridade: 'lendaria', efeito: 'thunderstorm', categoria: 'lendarias' },
      { id: 'ice', nome: 'Gelo Eterno', forma: 'circle', cor1: '#e0ffff', cor2: '#00bfff', preco: 5000, raridade: 'lendaria', efeito: 'ice', categoria: 'lendarias' },
      { id: 'shadow', nome: 'Sombra Viva', forma: 'circle', cor1: '#000000', cor2: '#2f2f2f', preco: 5000, raridade: 'lendaria', efeito: 'shadow', categoria: 'lendarias' },
      { id: 'nature', nome: 'Elemental da Natureza', forma: 'circle', cor1: '#32cd32', cor2: '#006400', preco: 5000, raridade: 'lendaria', efeito: 'nature', categoria: 'lendarias' },
      { id: 'skull', nome: 'Caveira Flamejante', forma: 'circle', cor1: '#ffffff', cor2: '#000000', preco: 5000, raridade: 'lendaria', efeito: 'skull', categoria: 'lendarias' },
      { id: 'cosmic_eye', nome: 'Olho Cósmico', forma: 'circle', cor1: '#ff00ff', cor2: '#800080', preco: 5000, raridade: 'lendaria', efeito: 'cosmic_eye', categoria: 'lendarias' },
      { id: 'ice_dragon', nome: 'Dragão de Gelo', forma: 'dragon', cor1: '#e0ffff', cor2: '#00bfff', preco: 5000, raridade: 'lendaria', efeito: 'ice_dragon', categoria: 'lendarias' },
      { id: 'volcano', nome: 'Vulcão', forma: 'circle', cor1: '#ff4500', cor2: '#8b0000', preco: 5000, raridade: 'lendaria', efeito: 'volcano', categoria: 'lendarias' },
      { id: 'wind', nome: 'Vento Cortante', forma: 'circle', cor1: '#ffffff', cor2: '#a0c4ff', preco: 5000, raridade: 'lendaria', efeito: 'wind', categoria: 'lendarias' },
      { id: 'arcane_mage', nome: 'Mago Arcano', forma: 'circle', cor1: '#8a2be2', cor2: '#ff69b4', preco: 5000, raridade: 'lendaria', efeito: 'arcane_mage', categoria: 'lendarias' },
      { id: 'pandora', nome: 'Pandora', forma: 'circle', cor1: '#ffd700', cor2: '#ff4500', preco: 5000, raridade: 'lendaria', efeito: 'pandora', categoria: 'lendarias' },
      { id: 'serpent', nome: 'Serpente', forma: 'circle', cor1: '#32cd32', cor2: '#008000', preco: 5000, raridade: 'lendaria', efeito: 'serpent', categoria: 'lendarias' },
      // Raras
      { id: 'inferno', nome: 'Inferno', forma: 'circle', cor1: '#ff0000', cor2: '#8b0000', preco: 5000, raridade: 'rara', efeito: 'fire', categoria: 'raras' },
      { id: 'ocean', nome: 'Oceano', forma: 'circle', cor1: '#00bfff', cor2: '#00008b', preco: 5500, raridade: 'rara', efeito: 'water', categoria: 'raras' },
      { id: 'floresta', nome: 'Floresta', forma: 'circle', cor1: '#228b22', cor2: '#006400', preco: 6000, raridade: 'rara', efeito: 'nature', categoria: 'raras' },
      { id: 'deserto', nome: 'Deserto', forma: 'circle', cor1: '#edc9af', cor2: '#8b4513', preco: 6500, raridade: 'rara', efeito: 'sand', categoria: 'raras' },
      { id: 'ceu', nome: 'Céu', forma: 'circle', cor1: '#87ceeb', cor2: '#4682b4', preco: 7000, raridade: 'rara', efeito: 'sky', categoria: 'raras' },
      { id: 'meteoro', nome: 'Meteoro', forma: 'circle', cor1: '#ff8c00', cor2: '#8b0000', preco: 7500, raridade: 'rara', efeito: 'meteor', categoria: 'raras' },
      { id: 'lava', nome: 'Lava', forma: 'circle', cor1: '#ff4500', cor2: '#8b0000', preco: 8000, raridade: 'rara', efeito: 'lava', categoria: 'raras' },
      { id: 'aurora', nome: 'Aurora', forma: 'circle', cor1: '#00ff7f', cor2: '#8a2be2', preco: 8500, raridade: 'rara', efeito: 'aurora', categoria: 'raras' },
      { id: 'espectral', nome: 'Espectral', forma: 'circle', cor1: '#ffffff', cor2: '#d3d3d3', preco: 9000, raridade: 'rara', efeito: 'spectral', categoria: 'raras' }
    ];

    // ============================================================
    // PATENTES
    // ============================================================
    var PATENTES = [
      { nome: 'Bronze', subdivisoes: 5, pontosPorSub: 10 },
      { nome: 'Prata', subdivisoes: 5, pontosPorSub: 20 },
      { nome: 'Ouro', subdivisoes: 5, pontosPorSub: 35 },
      { nome: 'Platina', subdivisoes: 5, pontosPorSub: 60 },
      { nome: 'Diamante', subdivisoes: 5, pontosPorSub: 100 },
      { nome: 'Mestre', subdivisoes: 5, pontosPorSub: 160 },
      { nome: 'Grão-Mestre', subdivisoes: 5, pontosPorSub: 260 },
      { nome: 'Lenda', subdivisoes: 5, pontosPorSub: 420 },
      { nome: 'Mito', subdivisoes: 5, pontosPorSub: 680 },
      { nome: 'Épico', subdivisoes: 5, pontosPorSub: 1100 },
      { nome: 'Lendário', subdivisoes: 5, pontosPorSub: 1800 },
      { nome: 'Imortal', subdivisoes: 1, pontosPorSub: 3000 }
    ];

    // ============================================================
    // TÍTULOS (listas completas)
    // ============================================================
    var TITLES = [
      { minWins: 1, title: 'Primeiro Passo' },
      { minWins: 10, title: 'Estrategista Iniciante' },
      { minWins: 100, title: 'Conquistador' },
      { minWins: 200, title: 'Mestre das Paredes' },
      { minWins: 300, title: 'Dominador' },
      { minWins: 400, title: 'Arquiteto' },
      { minWins: 500, title: 'Invencível' },
      { minWins: 600, title: 'Lenda' },
      { minWins: 700, title: 'O Implacável' },
      { minWins: 800, title: 'O Vigilante' },
      { minWins: 900, title: 'O Estrategista' },
      { minWins: 1000, title: 'O Mestre' },
      { minWins: 1100, title: 'O Incontestável' },
      { minWins: 1200, title: 'Sombra' },
      { minWins: 1400, title: 'Espectro' },
      { minWins: 1600, title: 'Fenômeno' },
      { minWins: 1800, title: 'Mito Vivo' },
      { minWins: 2000, title: 'O Imortal' },
      { minWins: 2200, title: 'O Imbatível' },
      { minWins: 2400, title: 'O Gladiador' },
      { minWins: 2600, title: 'O Lendário' },
      { minWins: 2800, title: 'O Supremo' },
      { minWins: 3000, title: 'O Primeiro' },
      { minWins: 3200, title: 'O Preciso' },
      { minWins: 3400, title: 'O Rápido' },
      { minWins: 3600, title: 'O Supremo' },
      { minWins: 3800, title: 'O Veloz' },
      { minWins: 4000, title: 'O Atemporal' },
      { minWins: 4500, title: 'O Vento' },
      { minWins: 5000, title: 'O Gênio' },
      { minWins: 5500, title: 'O Saltador' },
      { minWins: 6000, title: 'O Intocável' },
      { minWins: 7000, title: 'Dinamite' },
      { minWins: 8000, title: 'Velocidade Máxima' },
      { minWins: 9000, title: 'Tornado' },
      { minWins: 10000, title: 'Wall-Jumper' },
      { minWins: 12000, title: 'Corredor' },
      { minWins: 14000, title: 'O Morcego' },
      { minWins: 16000, title: 'Invisível' },
      { minWins: 18000, title: 'Imparável' },
      { minWins: 20000, title: 'O Mestre do Vento' },
      { minWins: 25000, title: 'O Incansável' },
      { minWins: 30000, title: 'Torpedo' },
      { minWins: 35000, title: 'O Veloz Gorgonzola' },
      { minWins: 40000, title: 'RELÂMPAGO' }
    ];

    var SEQUENCE_TITLES = [
      { minStreak: 1, title: 'Em Ascensão' },
      { minStreak: 2, title: 'Dois Passos à Frente' },
      { minStreak: 3, title: 'Tríplice Ameaça' },
      { minStreak: 4, title: 'Quatro Cantos' },
      { minStreak: 5, title: 'Pentagrama' },
      { minStreak: 6, title: 'Hexa' },
      { minStreak: 7, title: 'Sete Mares' },
      { minStreak: 8, title: 'Oito Tentáculos' },
      { minStreak: 9, title: 'Nove Vidas' },
      { minStreak: 10, title: 'Dez Dedos' },
      { minStreak: 12, title: 'Dúzia de Ouro' },
      { minStreak: 15, title: 'Quinze Movimentos' },
      { minStreak: 20, title: 'Vinte Léguas' },
      { minStreak: 25, title: 'Prata Pura' },
      { minStreak: 30, title: 'Trinta Graus' },
      { minStreak: 35, title: 'O Ferro' },
      { minStreak: 40, title: 'Quarentena' },
      { minStreak: 45, title: 'O Aço' },
      { minStreak: 50, title: 'Meio Século' },
      { minStreak: 60, title: 'Sessenta Segundos' },
      { minStreak: 70, title: 'O Bronze' },
      { minStreak: 80, title: 'Oitenta Oitavas' },
      { minStreak: 90, title: 'O Nove' },
      { minStreak: 100, title: 'Centurião' },
      { minStreak: 120, title: 'Cento e Vinte BPM' },
      { minStreak: 140, title: 'O Cobre' },
      { minStreak: 160, title: 'Cento e Sessenta Casas' },
      { minStreak: 180, title: 'Meia Volta' },
      { minStreak: 200, title: 'Bicentenário' },
      { minStreak: 250, title: 'O Titânio' },
      { minStreak: 300, title: 'Tricentenário' },
      { minStreak: 350, title: 'O Manganês' },
      { minStreak: 400, title: 'Quadricentenário' },
      { minStreak: 450, title: 'O Crómio' },
      { minStreak: 500, title: 'Meio Milhar' },
      { minStreak: 600, title: 'O Níquel' },
      { minStreak: 700, title: 'O Zinco' },
      { minStreak: 800, title: 'O Estanho' },
      { minStreak: 900, title: 'O Chumbo' },
      { minStreak: 1000, title: 'Milenar' },
      { minStreak: 1200, title: 'Mil Duzentos' },
      { minStreak: 1400, title: 'O Ferro Fundido' },
      { minStreak: 1600, title: 'O Aço Inox' },
      { minStreak: 1800, title: 'O Diamante' },
      { minStreak: 2000, title: 'Bimilenar' },
      { minStreak: 2500, title: 'O Rubi' },
      { minStreak: 3000, title: 'Trimilenar' },
      { minStreak: 4000, title: 'O Safira' },
      { minStreak: 5000, title: 'O Ônix' },
      { minStreak: 10000, title: 'O Imortal' }
    ];

    var GAMES_PLAYED_TITLES = [
      { minGames: 1, title: 'Recruta' },
      { minGames: 5, title: 'Explorador' },
      { minGames: 10, title: 'Curioso' },
      { minGames: 25, title: 'Aprendiz' },
      { minGames: 50, title: 'Veterano Iniciante' },
      { minGames: 100, title: 'Centurião da Mesa' },
      { minGames: 150, title: 'O Paciente' },
      { minGames: 200, title: 'Duas Centenas' },
      { minGames: 250, title: 'Quarto de Milhar' },
      { minGames: 300, title: 'Tricentenário' },
      { minGames: 350, title: 'O Observador' },
      { minGames: 400, title: 'Quadrigêmeo' },
      { minGames: 450, title: 'O Calculista' },
      { minGames: 500, title: 'Meio Milênio' },
      { minGames: 600, title: 'O Seiscentista' },
      { minGames: 700, title: 'O Setecentista' },
      { minGames: 800, title: 'O Oitocentista' },
      { minGames: 900, title: 'O Novecentista' },
      { minGames: 1000, title: 'O Milenar' },
      { minGames: 1100, title: 'O Onze Centenas' },
      { minGames: 1200, title: 'Dúzia de Centenas' },
      { minGames: 1300, title: 'O Treze Centenas' },
      { minGames: 1400, title: 'O Catorze Centenas' },
      { minGames: 1500, title: 'Quinze Centenas' },
      { minGames: 1600, title: 'O Dezesseis Centenas' },
      { minGames: 1700, title: 'O Dezessete Centenas' },
      { minGames: 1800, title: 'O Dezoito Centenas' },
      { minGames: 1900, title: 'O Dezenove Centenas' },
      { minGames: 2000, title: 'Vinte Centenas' },
      { minGames: 2500, title: 'O Vigoroso' },
      { minGames: 3000, title: 'Três Milhas' },
      { minGames: 3500, title: 'O Tático' },
      { minGames: 4000, title: 'O Quadrante' },
      { minGames: 4500, title: 'O Estrategista' },
      { minGames: 5000, title: 'Pentacampeão da Mesa' },
      { minGames: 6000, title: 'Hexacampeão da Mesa' },
      { minGames: 7000, title: 'Sete Mares de Tinta' },
      { minGames: 8000, title: 'Oito Mil Voltas' },
      { minGames: 9000, title: 'Nove Mil e Uma' },
      { minGames: 10000, title: 'O Mestre dos Tabuleiros' },
      { minGames: 12000, title: 'O Doze Milhas' },
      { minGames: 14000, title: 'O Catorze Milhas' },
      { minGames: 16000, title: 'O Dezesseis Milhas' },
      { minGames: 18000, title: 'O Dezoito Milhas' },
      { minGames: 20000, title: 'O Vinte Mil Léguas' },
      { minGames: 25000, title: 'O Titã' },
      { minGames: 30000, title: 'O Colosso' },
      { minGames: 40000, title: 'O Guardião do Tabuleiro' },
      { minGames: 50000, title: 'O Lendário' },
      { minGames: 100000, title: 'O Absoluto' }
    ];

    var LEVEL_TITLES = [
      { level: 1, title: 'Calouro' },
      { level: 2, title: 'Aventureiro' },
      { level: 3, title: 'Expectador' },
      { level: 4, title: 'Neófito' },
      { level: 5, title: 'Estudioso' },
      { level: 6, title: 'Dedicado' },
      { level: 7, title: 'Esforçado' },
      { level: 8, title: 'Persistente' },
      { level: 9, title: 'Resistente' },
      { level: 10, title: 'Sobrevivente' },
      { level: 11, title: 'Adaptável' },
      { level: 12, title: 'Raciocinador' },
      { level: 13, title: 'Analítico' },
      { level: 14, title: 'Lógico' },
      { level: 15, title: 'Metódico' },
      { level: 16, title: 'Sistemático' },
      { level: 17, title: 'Estratégico' },
      { level: 18, title: 'Ágil' },
      { level: 19, title: 'Sagaz' },
      { level: 20, title: 'Astuto' },
      { level: 21, title: 'Perspicaz' },
      { level: 22, title: 'Arguto' },
      { level: 23, title: 'Intuitivo' },
      { level: 24, title: 'Precursor' },
      { level: 25, title: 'Vanguardista' },
      { level: 26, title: 'Projetista' },
      { level: 27, title: 'Planejador' },
      { level: 28, title: 'Organizador' },
      { level: 29, title: 'Conselheiro' },
      { level: 30, title: 'Mentor' },
      { level: 31, title: 'Treinador' },
      { level: 32, title: 'Instrutor' },
      { level: 33, title: 'Educador' },
      { level: 34, title: 'Condutor' },
      { level: 35, title: 'Timoneiro' },
      { level: 36, title: 'Piloto' },
      { level: 37, title: 'Almirante' },
      { level: 38, title: 'Marechal' },
      { level: 39, title: 'Brigadeiro' },
      { level: 40, title: 'Tenente' },
      { level: 41, title: 'Sargento' },
      { level: 42, title: 'Cadete' },
      { level: 43, title: 'Oficial' },
      { level: 44, title: 'Decano' },
      { level: 45, title: 'Dignitário' },
      { level: 46, title: 'Notável' },
      { level: 47, title: 'Ilustre' },
      { level: 48, title: 'Eminente' },
      { level: 49, title: 'Honorável' },
      { level: 50, title: 'Venerável' },
      { level: 51, title: 'Sublime' },
      { level: 52, title: 'Magnífico' },
      { level: 53, title: 'Excelso' },
      { level: 54, title: 'Esplêndido' },
      { level: 55, title: 'Glorioso' },
      { level: 56, title: 'Triunfante' },
      { level: 57, title: 'Vitorioso' },
      { level: 58, title: 'Campeão' },
      { level: 59, title: 'Monarca' },
      { level: 60, title: 'Soberano' },
      { level: 61, title: 'Imperador' },
      { level: 62, title: 'Czar' },
      { level: 63, title: 'Sultão' },
      { level: 64, title: 'Faraó' },
      { level: 65, title: 'Xá' },
      { level: 66, title: 'Rajá' },
      { level: 67, title: 'Cônsul' },
      { level: 68, title: 'Senador' },
      { level: 69, title: 'Prefeito' },
      { level: 70, title: 'Embaixador' },
      { level: 71, title: 'Chanceler' },
      { level: 72, title: 'Regente' },
      { level: 73, title: 'Arquimago' },
      { level: 74, title: 'Xamã' },
      { level: 75, title: 'Druida' },
      { level: 76, title: 'Alquimista' },
      { level: 77, title: 'Feiticeiro' },
      { level: 78, title: 'Bruxo' },
      { level: 79, title: 'Místico' },
      { level: 80, title: 'Oculto' },
      { level: 81, title: 'Mítico' },
      { level: 82, title: 'Etéreo' },
      { level: 83, title: 'Celestial' },
      { level: 84, title: 'Astral' },
      { level: 85, title: 'Cósmico' },
      { level: 86, title: 'Galáctico' },
      { level: 87, title: 'Nebuloso' },
      { level: 88, title: 'Sideral' },
      { level: 89, title: 'Perpétuo' },
      { level: 90, title: 'Onisciente' },
      { level: 91, title: 'O Incriado' },
      { level: 92, title: 'O Primordial' },
      { level: 93, title: 'O Ancestral' },
      { level: 94, title: 'O Arcano' },
      { level: 95, title: 'O Transcendente' },
      { level: 96, title: 'O Soberano Absoluto' },
      { level: 97, title: 'O Eterno' },
      { level: 98, title: 'O Infinitário' },
      { level: 99, title: 'O Todo-Poderoso' },
      { level: 100, title: 'O Onipresente' }
    ];

    var LOCAL_GAMES_TITLES = [
      { minLocalGames: 1, title: 'Rival do Sofá' },
      { minLocalGames: 2, title: 'Irmão de Batalha' },
      { minLocalGames: 3, title: 'Duelista Local' },
      { minLocalGames: 4, title: 'Cara a Cara' },
      { minLocalGames: 5, title: 'Lado a Lado' },
      { minLocalGames: 6, title: 'Amigo Adversário' },
      { minLocalGames: 7, title: 'Tela Compartilhada' },
      { minLocalGames: 8, title: 'Controle Dividido' },
      { minLocalGames: 9, title: 'Desafiante da Sala' },
      { minLocalGames: 10, title: 'Oponente Caseiro' },
      { minLocalGames: 12, title: 'Convidado Especial' },
      { minLocalGames: 14, title: 'Anfitrião do Jogo' },
      { minLocalGames: 16, title: 'Visitante da Vez' },
      { minLocalGames: 18, title: 'Dono do Controle' },
      { minLocalGames: 20, title: 'Iniciador do Duelo' },
      { minLocalGames: 22, title: 'Segundo Movimento' },
      { minLocalGames: 24, title: 'Fera do Quarto' },
      { minLocalGames: 26, title: 'Rei do Quintal' },
      { minLocalGames: 28, title: 'Espelho do Jogo' },
      { minLocalGames: 30, title: 'Cérebro da Garagem' },
      { minLocalGames: 32, title: 'Duetista' },
      { minLocalGames: 34, title: 'Companheiro de Banco' },
      { minLocalGames: 36, title: 'X1 da Tela' },
      { minLocalGames: 38, title: 'Encarador de Desafios' },
      { minLocalGames: 40, title: 'Juiz da Disputa' },
      { minLocalGames: 42, title: 'Herói Offline' },
      { minLocalGames: 44, title: 'Senhor do Sofá' },
      { minLocalGames: 46, title: 'Especialista em Raiva Amiga' },
      { minLocalGames: 48, title: 'O Agitador' },
      { minLocalGames: 50, title: 'O Brincalhão' },
      { minLocalGames: 52, title: 'O Intruso' },
      { minLocalGames: 54, title: 'O Mandachuva' },
      { minLocalGames: 56, title: 'O Equilibrista' },
      { minLocalGames: 58, title: 'O Sereno' },
      { minLocalGames: 60, title: 'O Último Local' },
      { minLocalGames: 62, title: 'Vencedor da Sala' },
      { minLocalGames: 64, title: 'O Lobo da Tela' },
      { minLocalGames: 66, title: 'Caçador de Rivais' },
      { minLocalGames: 68, title: 'O Predador do Controle' },
      { minLocalGames: 70, title: 'O Silencioso do Jogo' },
      { minLocalGames: 72, title: 'O Famoso da Varanda' },
      { minLocalGames: 74, title: 'O Eco da Partida' },
      { minLocalGames: 76, title: 'O Chef do Jogo' },
      { minLocalGames: 78, title: 'O Atleta do Tabuleiro' },
      { minLocalGames: 80, title: 'O Jogador Misterioso' },
      { minLocalGames: 82, title: 'O Reflexo do Controle' },
      { minLocalGames: 84, title: 'O Troféu da Casa' },
      { minLocalGames: 86, title: 'O Protetor do Controle' },
      { minLocalGames: 88, title: 'O Viajante da Sala' },
      { minLocalGames: 90, title: 'O Remanescente' },
      { minLocalGames: 92, title: 'O Duplo' },
      { minLocalGames: 94, title: 'O Espectador Ativo' },
      { minLocalGames: 96, title: 'O Juiz Final' },
      { minLocalGames: 98, title: 'O Campeão do Quintal' },
      { minLocalGames: 100, title: 'Centésimo Local' },
      { minLocalGames: 110, title: 'O Décimo Primeiro' },
      { minLocalGames: 120, title: 'O Duzentésimo' },
      { minLocalGames: 130, title: 'O Tricentésimo' },
      { minLocalGames: 140, title: 'O Quadringentésimo' },
      { minLocalGames: 150, title: 'O Quingentésimo' },
      { minLocalGames: 160, title: 'O Sexcentésimo' },
      { minLocalGames: 170, title: 'O Septingentésimo' },
      { minLocalGames: 180, title: 'O Octingentésimo' },
      { minLocalGames: 190, title: 'O Noningentésimo' },
      { minLocalGames: 200, title: 'O Bicentenário Local' },
      { minLocalGames: 220, title: 'O Duzentos e Vinte' },
      { minLocalGames: 240, title: 'O Duzentos e Quarenta' },
      { minLocalGames: 260, title: 'O Duzentos e Sessenta' },
      { minLocalGames: 280, title: 'O Duzentos e Oitenta' },
      { minLocalGames: 300, title: 'O Tercenário Local' },
      { minLocalGames: 320, title: 'O Trezentos e Vinte' },
      { minLocalGames: 340, title: 'O Trezentos e Quarenta' },
      { minLocalGames: 360, title: 'O Trezentos e Sessenta' },
      { minLocalGames: 380, title: 'O Trezentos e Oitenta' },
      { minLocalGames: 400, title: 'O Quadringentário Local' },
      { minLocalGames: 420, title: 'O Quatrocentos e Vinte' },
      { minLocalGames: 440, title: 'O Quatrocentos e Quarenta' },
      { minLocalGames: 460, title: 'O Quatrocentos e Sessenta' },
      { minLocalGames: 480, title: 'O Quatrocentos e Oitenta' },
      { minLocalGames: 500, title: 'O Quingentário Local' },
      { minLocalGames: 550, title: 'O Quinhentos e Cinquenta' },
      { minLocalGames: 600, title: 'O Sexcentenário Local' },
      { minLocalGames: 650, title: 'O Seiscentos e Cinquenta' },
      { minLocalGames: 700, title: 'O Septingenário Local' },
      { minLocalGames: 750, title: 'O Setecentos e Cinquenta' },
      { minLocalGames: 800, title: 'O Octingenário Local' },
      { minLocalGames: 850, title: 'O Oitocentos e Cinquenta' },
      { minLocalGames: 900, title: 'O Ningenário Local' },
      { minLocalGames: 950, title: 'O Novecentos e Cinquenta' },
      { minLocalGames: 1000, title: 'O Milenar Local' },
      { minLocalGames: 1200, title: 'O Mil e Duzentos Local' },
      { minLocalGames: 1400, title: 'O Mil e Quatrocentos Local' },
      { minLocalGames: 1600, title: 'O Mil e Seiscentos Local' },
      { minLocalGames: 1800, title: 'O Mil e Oitocentos Local' },
      { minLocalGames: 2000, title: 'O Bimilenar Local' },
      { minLocalGames: 2500, title: 'O Dois Mil e Quinhentos' },
      { minLocalGames: 3000, title: 'O Trimilenar Local' },
      { minLocalGames: 4000, title: 'O Quadrimilenar Local' },
      { minLocalGames: 5000, title: 'O Quinquemilenar Local' },
      { minLocalGames: 7500, title: 'O Sete Mil e Quinhentos' },
      { minLocalGames: 10000, title: 'O Dez Milênios Local' }
    ];

    var IA_WINS_TITLES = [
      { minVsIAWins: 1, title: 'Primeiro Contato' },
      { minVsIAWins: 3, title: 'Iniciador de Sistema' },
      { minVsIAWins: 5, title: 'Boot Completo' },
      { minVsIAWins: 10, title: 'Carregando...' },
      { minVsIAWins: 15, title: 'Compilador' },
      { minVsIAWins: 20, title: 'Depurador' },
      { minVsIAWins: 30, title: 'Executável' },
      { minVsIAWins: 40, title: 'Binário' },
      { minVsIAWins: 50, title: 'Algoritmo' },
      { minVsIAWins: 60, title: 'Iterativo' },
      { minVsIAWins: 70, title: 'Recursivo' },
      { minVsIAWins: 85, title: 'Otimizador' },
      { minVsIAWins: 100, title: 'Predictor' },
      { minVsIAWins: 120, title: 'Classificador' },
      { minVsIAWins: 140, title: 'Regressão' },
      { minVsIAWins: 160, title: 'Clusterizador' },
      { minVsIAWins: 180, title: 'Rede Neural' },
      { minVsIAWins: 200, title: 'Deep Learner' },
      { minVsIAWins: 250, title: 'Treinamento Completo' },
      { minVsIAWins: 300, title: 'Aprendizado Não-Supervisionado' },
      { minVsIAWins: 350, title: 'Reforço Positivo' },
      { minVsIAWins: 400, title: 'Gradiente Descendente' },
      { minVsIAWins: 450, title: 'Backpropagation' },
      { minVsIAWins: 500, title: 'Foward Pass' },
      { minVsIAWins: 600, title: 'Tensor' },
      { minVsIAWins: 700, title: 'Data Frame' },
      { minVsIAWins: 800, title: 'Dataset' },
      { minVsIAWins: 900, title: 'Pipeline' },
      { minVsIAWins: 1000, title: 'Feature Extraction' },
      { minVsIAWins: 1200, title: 'Embedding' },
      { minVsIAWins: 1400, title: 'Transformador' },
      { minVsIAWins: 1600, title: 'Ativação' },
      { minVsIAWins: 1800, title: 'Pesos Ajustados' },
      { minVsIAWins: 2000, title: 'Bias Calculado' },
      { minVsIAWins: 2200, title: 'Função de Custo' },
      { minVsIAWins: 2500, title: 'Overfitting' },
      { minVsIAWins: 2800, title: 'Underfitting' },
      { minVsIAWins: 3100, title: 'Validação Cruzada' },
      { minVsIAWins: 3500, title: 'Early Stopping' },
      { minVsIAWins: 4000, title: 'Checkpoint' },
      { minVsIAWins: 4500, title: 'Restauração' },
      { minVsIAWins: 5000, title: 'Inferência' },
      { minVsIAWins: 5500, title: 'Tokenizador' },
      { minVsIAWins: 6000, title: 'Prompt' },
      { minVsIAWins: 6500, title: 'Fine-Tuning' },
      { minVsIAWins: 7000, title: 'Zero-Shot' },
      { minVsIAWins: 7500, title: 'Few-Shot' },
      { minVsIAWins: 8500, title: 'Alucinação' },
      { minVsIAWins: 9500, title: 'Singularidade' },
      { minVsIAWins: 10000, title: 'Despertar da IA' }
    ];

    // ============================================================
    // MEDALHAS
    // ============================================================
    var MEDALS = [
      { id: 'medal_bronze_wins', nome: 'Bronze de Vitórias', desc: 'Vença 10 partidas.', check: function(stats){ return stats.wins >= 10; }, svg: function(unlocked) { return medalSVG('#cd7f32', '#8b5a2b', 'bronze', unlocked); } },
      { id: 'medal_silver_wins', nome: 'Prata de Vitórias', desc: 'Vença 50 partidas.', check: function(stats){ return stats.wins >= 50; }, svg: function(unlocked) { return medalSVG('#c0c0c0', '#808080', 'silver', unlocked); } },
      { id: 'medal_gold_wins', nome: 'Ouro de Vitórias', desc: 'Vença 100 partidas.', check: function(stats){ return stats.wins >= 100; }, svg: function(unlocked) { return medalSVG('#ffd700', '#b8860b', 'gold', unlocked); } },
      { id: 'medal_expert_wins', nome: 'Caçador de Expert', desc: 'Vença 10 partidas contra a IA Expert.', check: function(stats){ return (stats.expertWins || 0) >= 10; }, svg: function(unlocked) { return medalSVG('#8a2be2', '#4b0082', 'expert', unlocked); } },
      { id: 'medal_level_50', nome: 'Marco de Nível 50', desc: 'Alcance o nível 50.', check: function(stats){ return stats.level >= 50; }, svg: function(unlocked) { return medalSVG('#00ced1', '#008b8b', 'level', unlocked); } },
      { id: 'medal_local_100', nome: 'Rei do Sofá', desc: 'Jogue 100 partidas locais.', check: function(stats){ return (stats.localGames || 0) >= 100; }, svg: function(unlocked) { return medalSVG('#ff6347', '#8b0000', 'local', unlocked); } }
    ];

    function medalSVG(color1, color2, symbol, unlocked) {
      var colors = unlocked ? [color1, color2] : ['#555', '#777'];
      var symbolPath = getSymbolPath(symbol);
      return '<svg width="40" height="40" viewBox="0 0 40 40"><defs><radialGradient id="grad_'+symbol+'" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="'+colors[0]+'"/><stop offset="100%" stop-color="'+colors[1]+'"/></radialGradient></defs><circle cx="20" cy="20" r="18" fill="url(#grad_'+symbol+')" stroke="'+colors[1]+'" stroke-width="2"/>'+symbolPath+'</svg>';
    }

    function getSymbolPath(symbol) {
      switch(symbol) {
        case 'bronze': case 'silver': case 'gold':
          return '<polygon points="20,9 24,17 32,17 26,23 28,31 20,26 12,31 14,23 8,17 16,17" fill="#fff" opacity="0.9"/>';
        case 'expert':
          return '<path d="M20,8 L22,18 L30,18 L24,23 L26,32 L20,26 L14,32 L16,23 L10,18 L18,18 Z" fill="#fff" opacity="0.8"/>';
        case 'level':
          return '<polyline points="12,25 20,15 28,25" stroke="#fff" stroke-width="2" fill="none" opacity="0.9"/>';
        case 'local':
          return '<rect x="14" y="12" width="12" height="16" rx="2" fill="none" stroke="#fff" stroke-width="2" opacity="0.8"/>';
        default:
          return '<circle cx="20" cy="20" r="6" fill="#fff" opacity="0.8"/>';
      }
    }

    function renderMedalsInProfile(listElement, stats) {
      var unlockedMedals = MEDALS.filter(function(medal) { return medal.check(stats); });
      var container = document.createElement('div');
      container.style.cssText = 'padding:12px;border-top:1px solid rgba(255,215,140,0.06);border-bottom:1px solid rgba(255,215,140,0.06);margin:10px 0;';
      container.innerHTML = '<div style="font-weight:700;color:#d4a373;margin-bottom:8px;font-size:11px;">MEDALHAS</div>';
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;';
      for (var i = 0; i < MEDALS.length; i++) {
        var medal = MEDALS[i];
        var unlocked = unlockedMedals.indexOf(medal) !== -1;
        var medalDiv = document.createElement('div');
        medalDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;';
        medalDiv.innerHTML = '<span class="medal-svg">' + medal.svg(unlocked) + '</span>';
        (function(m) {
          medalDiv.addEventListener('click', function() { alert(m.nome + ': ' + m.desc); });
        })(medal);
        row.appendChild(medalDiv);
      }
      container.appendChild(row);
      listElement.appendChild(container);
    }

    // ============================================================
    // FUNÇÕES AUXILIARES (contas, hash, persistência)
    // ============================================================
    function getDeviceId() {
    var stored = localStorage.getItem('quoridor_device_id');
    if (!stored) {
        stored = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('quoridor_device_id', stored);
    }
    return stored;
}

function updateSessionAlive() {
    if (currentUser && window.currentUserId) {
        db.collection('sessions').doc(window.currentUserId).set({
            deviceId: deviceId,
            lastSeen: Date.now()
        }, { merge: true }).catch(console.error);
    }
}

var sessionUpdateInterval = null;
function startSessionAlive() {
    if (sessionUpdateInterval) clearInterval(sessionUpdateInterval);
    sessionUpdateInterval = setInterval(updateSessionAlive, 30000);
}

function getAccounts() {
      try {
        return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {};
      } catch(e) {
        return {};
      }
    }

    function saveAccounts(accounts) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }

    function hashPassword(pwd) {
      var hash = 0;
      for (var i = 0; i < pwd.length; i++) {
        var char = pwd.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return 'h' + hash.toString(36);
    }

    // Converte o nome de usuário em um e-mail técnico
    // usado internamente pelo Firebase Authentication.
    function usernameToAuthEmail(username) {
      var normalized = String(username || '').trim().toLowerCase();
      var hex = '';

      for (var i = 0; i < normalized.length; i++) {
        hex += normalized.charCodeAt(i).toString(16);
      }

      return 'u' + hex + '@quoridor-online-2823d.firebaseapp.com';
    }

    function defaultUserStats() {
      return {
        games: 0,
        wins: 0,
        losses: 0,
        streak: 0,
        maxStreak: 0,
        level: 1,
        points: 0,
        rankPoints: 0,
        maxRankPoints: 0,
        rank: 'Bronze V',
        history: [],
        totalWalls: 0,
        totalTurns: 0,
        sumPointsVictories: 0,
        opponentEloSum: 0,
        opponentCount: 0,
        xp: 0,
        equippedTitle: 'Recruta',
        ownedSkins: ['classic'],
        equippedSkin: 'classic',
        localGames: 0,
        expertWins: 0,
        medals: []
      };
    }

    async function createUser(username, password) {
      username = String(username || '').trim();
      password = String(password || '');
      window.lastAuthError = '';

      if (!username || !password) {
        window.lastAuthError = 'Preencha nickname e senha';
        return false;
      }
      if (username.length < 3) {
        window.lastAuthError = 'Nickname minimo 3 caracteres';
        return false;
      }
      if (username.length > 20) {
        window.lastAuthError = 'Nickname maximo 20 caracteres';
        return false;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        window.lastAuthError = 'Use somente letras, numeros e _ no nickname';
        return false;
      }
      if (password.length < 6) {
        window.lastAuthError = 'Senha minimo 6 caracteres';
        return false;
      }
      if (password !== document.getElementById('login-confirm').value) {
        window.lastAuthError = 'As senhas nao coincidem';
        return false;
      }

      var email = usernameToAuthEmail(username);
      var normalizedUsername = username.toLowerCase();

      try {
        var nickSnap = await db.collection('usernames').doc(normalizedUsername).get();
        if (nickSnap.exists) {
          window.lastAuthError = 'Este nickname ja existe. Va em ENTRAR.';
          return false;
        }
      } catch (e0) {
        console.error('Erro ao verificar nickname:', e0);
        window.lastAuthError = 'Nao foi possivel verificar o nickname.';
        return false;
      }

      var credential;
      try {
        credential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        var user = credential.user;
        if (!user || !user.uid) {
          window.lastAuthError = 'Nao foi possivel obter o ID do usuario.';
          return false;
        }

        var userId = user.uid;
        var stats = defaultUserStats();

        await db.collection('users').doc(userId).set({
          userId: userId,
          id: userId,
          uid: userId,
          username: username,
          normalizedUsername: normalizedUsername,
          emailAuth: email,
          stats: stats,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: false });

        await db.collection('usernames').doc(normalizedUsername).set({
          username: username,
          uid: userId,
          userId: userId,
          emailAuth: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: false });

        var accounts = getAccounts();
        accounts[username] = {
          uid: userId,
          userId: userId,
          username: username,
          normalizedUsername: normalizedUsername,
          passwordHash: '',
          stats: stats
        };
        saveAccounts(accounts);

        currentUser = username;
        window.currentUserId = userId;
        return true;
      } catch (error) {
        console.error('Erro ao criar conta:', error);
        if (error && error.code === 'auth/email-already-in-use') {
          window.lastAuthError = 'Conta ja existe. Use ENTRAR.';
        } else if (error && error.code === 'auth/weak-password') {
          window.lastAuthError = 'Senha fraca (minimo 6 caracteres)';
        } else if (error && error.code === 'auth/operation-not-allowed') {
          window.lastAuthError = 'Ative Email/Senha no Firebase Authentication';
        } else if (error && error.code === 'permission-denied') {
          window.lastAuthError = 'O Firebase recusou o cadastro. Verifique as regras do Firestore.';
        } else {
          window.lastAuthError = (error && (error.message || error.code)) || 'Erro ao criar conta';
        }
        return false;
      }
    }

    async function loginUser(username, password) {
      username = String(username || '').trim();
      password = String(password || '');
      window.lastAuthError = '';

      if (!username || !password) {
        window.lastAuthError = 'Preencha usuario e senha';
        return false;
      }

      var normalizedUsername = username.toLowerCase();
      var candidates = [];

      function pushEmail(em) {
        if (!em) return;
        em = String(em).trim().toLowerCase();
        if (candidates.indexOf(em) === -1) candidates.push(em);
      }

      if (username.indexOf('@') >= 0) {
        pushEmail(username);
      } else {
        // Formato atual.
        pushEmail(usernameToAuthEmail(username));

        // Compatibilidade com formatos antigos ja existentes.
        var hex = '';
        for (var i = 0; i < normalizedUsername.length; i++) {
          hex += normalizedUsername.charCodeAt(i).toString(16);
        }
        pushEmail('u' + hex + '@quoridor-online-2823d.firebaseapp.com');
        pushEmail('u' + hex + '@quoridor-online-2823.firebaseapp.com');
        pushEmail(normalizedUsername + '@quoridor.local');

        try {
          var nickDoc = await db.collection('usernames').doc(normalizedUsername).get();
          if (nickDoc.exists) {
            var nickData = nickDoc.data() || {};
            pushEmail(nickData.emailAuth);
          }
        } catch (lookupError) {
          console.warn('Nao foi possivel consultar usernames:', lookupError);
        }
      }

      var lastErr = null;

      for (var c = 0; c < candidates.length; c++) {
        try {
          var credential = await firebase.auth().signInWithEmailAndPassword(candidates[c], password);
          var user = credential.user;

          if (!user || !user.uid) {
            lastErr = { code: 'auth/invalid-credential', message: 'Credencial invalida' };
            continue;
          }

          var doc = await db.collection('users').doc(user.uid).get();

          // LOGIN NUNCA cria users/{uid}. Se nao existe, a conta esta incompleta.
          if (!doc.exists) {
            try { await firebase.auth().signOut(); } catch (e) {}
            window.lastAuthError = 'A conta existe no Authentication, mas o perfil do jogador nao foi encontrado.';
            return false;
          }

          var data = doc.data() || {};
          var displayName = data.username || username;
          var stats = data.stats || defaultUserStats();

          var accounts = getAccounts();
          accounts[displayName] = {
            uid: user.uid,
            userId: user.uid,
            username: displayName,
            normalizedUsername: data.normalizedUsername || displayName.toLowerCase(),
            passwordHash: '',
            stats: stats
          };
          saveAccounts(accounts);

          currentUser = displayName;
          window.currentUserId = user.uid;
          return true;
        } catch (error) {
          lastErr = error;
        }
      }

      if (lastErr && lastErr.code === 'auth/too-many-requests') {
        window.lastAuthError = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      } else if (lastErr && lastErr.code === 'auth/network-request-failed') {
        window.lastAuthError = 'Falha de conexao com o Firebase.';
      } else if (lastErr && (lastErr.code === 'auth/wrong-password' || lastErr.code === 'auth/invalid-credential' || lastErr.code === 'auth/user-not-found')) {
        window.lastAuthError = 'Usuario ou senha incorretos.';
      } else {
        window.lastAuthError = (lastErr && (lastErr.message || lastErr.code)) || 'Usuario ou senha invalidos';
      }
      return false;
    }

    function getUserStats(username) {

      var accounts = getAccounts();

      return (
        accounts[username] &&
        accounts[username].stats
      )
        ? accounts[username].stats
        : defaultUserStats();
    }

    function updateUserStats(username, newStats) {
      var accounts = getAccounts();

      if (!accounts[username]) return;

      accounts[username].stats = newStats;
      saveAccounts(accounts);

      // Também salva globalmente no Firestore.
      try {
        var authUser = firebase.auth().currentUser;

        if (authUser) {
          db.collection('users')
            .doc(authUser.uid)
            .set({
              username: username,
              normalizedUsername: username.toLowerCase(),
              stats: newStats,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true })
            .catch(function(error) {
              console.error(
                'Erro ao sincronizar estatísticas:',
                error
              );
            });
        }
      } catch(e) {
        console.error(
          'Erro ao sincronizar conta:',
          e
        );
      }
    }

    function showScreen(id) {
      var target = document.getElementById(id);
      if (!target) {
        console.warn('Tela nao encontrada:', id);
        return;
      }
      document.querySelectorAll('.screen').forEach(function(screen) {
        screen.classList.remove('active');
      });
      target.classList.add('active');
    }

    // ============================================================
    // RANK (PATENTE) FUNCTIONS
    // ============================================================
    function obterPatente(points) {
      var acumulado = 0;
      for (var i = 0; i < PATENTES.length; i++) {
        var p = PATENTES[i];
        var total = p.subdivisoes * p.pontosPorSub;
        if (points < acumulado + total || p.nome === 'Imortal') {
          var pts = points - acumulado;
          var idx = Math.floor(pts / p.pontosPorSub);
          var sub = p.subdivisoes === 1 ? '' : ['V','IV','III','II','I'][Math.min(idx,4)];
          return { nome: p.nome, sub: sub, nomeCompleto: p.nome + (sub ? ' ' + sub : '') };
        }
        acumulado += total;
      }
      return { nome: 'Imortal', sub: '', nomeCompleto: 'Imortal' };
    }

    function obterProximaPatente(points) {
      var atual = obterPatente(points);
      if (atual.nome === 'Imortal') return null;
      var acumulado = 0;
      for (var i = 0; i < PATENTES.length; i++) {
        var p = PATENTES[i];
        var total = p.subdivisoes * p.pontosPorSub;
        if (points < acumulado + total) {
          var pts = points - acumulado;
          var idx = Math.floor(pts / p.pontosPorSub);
          if (idx < 4) return p.nome + ' ' + ['V','IV','III','II','I'][idx+1];
          var next = PATENTES[i+1];
          return next.nome === 'Imortal' ? 'Imortal' : next.nome + ' V';
        }
        acumulado += total;
      }
      return null;
    }

    function obterProgresso(points) {
      var acumulado = 0;
      for (var i = 0; i < PATENTES.length; i++) {
        var p = PATENTES[i];
        var total = p.subdivisoes * p.pontosPorSub;
        if (points < acumulado + total || p.nome === 'Imortal') {
          var pts = points - acumulado;
          var idx = Math.floor(pts / p.pontosPorSub);
          return Math.min(100, Math.max(0, ((pts - idx * p.pontosPorSub) / p.pontosPorSub) * 100));
        }
        acumulado += total;
      }
      return 100;
    }

    function getRank(points) { return obterPatente(points).nomeCompleto; }

    function updateRankDisplay(username) {
      var stats = getUserStats(username);
      var points = stats.rankPoints || 0;
      document.getElementById('rank-badge').textContent = obterPatente(points).nomeCompleto;
      document.getElementById('rank-points').textContent = points.toFixed(1) + ' pts';
      var prox = obterProximaPatente(points);
      document.getElementById('rank-indicator-btn').textContent = prox ? 'Próx: ' + prox : 'MAX';
      document.getElementById('rank-progress-fill').style.width = obterProgresso(points) + '%';
    }

    // ============================================================
    // TITLES FUNCTIONS
    // ============================================================
    var currentTitlesTab = 'vitorias';
    var titleSearchQuery = '';

    function equipTitle(title) {
      var stats = getUserStats(currentUser);
      stats.equippedTitle = title;
      updateUserStats(currentUser, stats);
      renderCurrentTitlesTab();
    }

    function matchesQuery(title) {
      if (!titleSearchQuery) return true;
      return title.toLowerCase().includes(titleSearchQuery);
    }

    function renderTitleList(listElement, arr, key, iconUnlocked, iconLocked, reqPrefix) {
      var stats = getUserStats(currentUser);
      var val = 0;
      if (key === 'wins') val = stats.wins || 0;
      else if (key === 'maxStreak') val = stats.maxStreak || 0;
      else if (key === 'games') val = stats.games || 0;
      else if (key === 'level') val = stats.level || 1;
      else if (key === 'localGames') val = stats.localGames || 0;
      else if (key === 'expertWins') val = stats.expertWins || 0;
      var equipped = stats.equippedTitle || 'Recruta';
      listElement.innerHTML = '';
      if (key === 'wins') {
        var recrutaItem = document.createElement('div');
        recrutaItem.className = 'title-item unlocked';
        recrutaItem.innerHTML = '<span class="title-icon">👶</span><div class="title-info"><div class="title-name">Recruta</div><div class="title-req">Desbloqueado automaticamente</div></div>' +
          (equipped === 'Recruta' ? '<button class="title-equip-btn equipped" disabled>✓ Em uso</button>' : '<button class="title-equip-btn" data-title="Recruta">Usar</button>');
        if (matchesQuery('Recruta')) listElement.appendChild(recrutaItem);
      }
      for (var i = 0; i < arr.length; i++) {
        var t = arr[i];
        if (!matchesQuery(t.title)) continue;
        var threshold = t.minWins || t.minStreak || t.minGames || t.level || t.minLocalGames || t.minVsIAWins || 0;
        var unlocked = val >= threshold;
        var item = document.createElement('div');
        item.className = 'title-item' + (unlocked ? ' unlocked' : ' locked');
        item.innerHTML = '<span class="title-icon">' + (unlocked ? iconUnlocked : '🔒') + '</span>' +
          '<div class="title-info"><div class="title-name">' + t.title + '</div><div class="title-req">' + reqPrefix + ' ' + threshold + '</div></div>' +
          (unlocked ? (equipped === t.title ? '<button class="title-equip-btn equipped" disabled>✓ Em uso</button>' : '<button class="title-equip-btn" data-title="' + t.title + '">Usar</button>') : '<span class="title-status">🔒</span>');
        listElement.appendChild(item);
      }
      var buttons = listElement.querySelectorAll('.title-equip-btn[data-title]');
      for (var j = 0; j < buttons.length; j++) {
        buttons[j].addEventListener('click', function(e) { e.stopPropagation(); equipTitle(this.getAttribute('data-title')); });
      }
    }

    function renderCurrentTitlesTab() {
      var list = document.getElementById('titles-list');
      if (currentTitlesTab === 'vitorias') renderTitleList(list, TITLES, 'wins', '🏆', '🔒', 'Requer');
      else if (currentTitlesTab === 'sequencia') renderTitleList(list, SEQUENCE_TITLES, 'maxStreak', '🔥', '🔒', 'Sequência de');
      else if (currentTitlesTab === 'partidas') renderTitleList(list, GAMES_PLAYED_TITLES, 'games', '🎮', '🔒', 'Requer');
      else if (currentTitlesTab === 'nivel') renderTitleList(list, LEVEL_TITLES, 'level', '⭐', '🔒', 'Requer nível');
      else if (currentTitlesTab === '2p') renderTitleList(list, LOCAL_GAMES_TITLES, 'localGames', '👥', '🔒', 'Requer');
      else if (currentTitlesTab === 'vsia') renderTitleList(list, IA_WINS_TITLES, 'expertWins', '🤖', '🔒', 'Requer');
      else list.innerHTML = '<div class="history-empty" style="color:#b8a99a;padding:30px 0;text-align:center;">Em breve</div>';
    }

    function openTitles() {
      var tabs = document.querySelectorAll('.tab-btn');
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === currentTitlesTab);
        tabs[i].onclick = function() {
          currentTitlesTab = this.getAttribute('data-tab');
          document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
          this.classList.add('active');
          document.getElementById('title-search').value = '';
          titleSearchQuery = '';
          renderCurrentTitlesTab();
        };
      }
      document.getElementById('title-search').value = '';
      titleSearchQuery = '';
      renderCurrentTitlesTab();
      document.getElementById('titles-overlay').classList.add('show');
    }

    function closeTitles() {
      document.getElementById('titles-overlay').classList.remove('show');
      document.getElementById('title-search').value = '';
      titleSearchQuery = '';
    }

    document.getElementById('title-search').addEventListener('input', function() {
      titleSearchQuery = this.value.trim().toLowerCase();
      renderCurrentTitlesTab();
    });

    // ============================================================
    // SKINS OVERLAY
    // ============================================================
    var currentSkinsTab = 'simples';

    function drawSkinPreview(canvas, skin) {
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  // Tamanho mínimo (48x48) para não cortar efeitos
  canvas.width = 48;
  canvas.height = 48;
  ctx.clearRect(0,0,48,48);
  var x = 24, y = 24, rad = 14;

  // Desenha a forma base (igual ao tabuleiro)
  ctx.save();
  var grad = ctx.createRadialGradient(x - rad*0.3, y - rad*0.35, rad*0.05, x, y, rad);
  grad.addColorStop(0, skin.cor1);
  grad.addColorStop(1, skin.cor2);
  ctx.fillStyle = grad;
  ctx.beginPath();
  switch(skin.forma) {
    case 'circle': ctx.arc(x, y, rad, 0, Math.PI*2); break;
    case 'square': ctx.rect(x-rad, y-rad, rad*2, rad*2); break;
    case 'diamond': ctx.moveTo(x, y-rad); ctx.lineTo(x+rad, y); ctx.lineTo(x, y+rad); ctx.lineTo(x-rad, y); ctx.closePath(); break;
    case 'hexagon': for (var k=0; k<6; k++) { var angle = Math.PI/6 + k*Math.PI/3; var hx = x + rad*Math.cos(angle), hy = y + rad*Math.sin(angle); if(k===0) ctx.moveTo(hx,hy); else ctx.lineTo(hx,hy); } ctx.closePath(); break;
    case 'star': for (var k=0; k<10; k++) { var angle = -Math.PI/2 + k*Math.PI/5; var radius = k%2===0 ? rad : rad*0.5; var sx = x + radius*Math.cos(angle), sy = y + radius*Math.sin(angle); if(k===0) ctx.moveTo(sx,sy); else ctx.lineTo(sx,sy); } ctx.closePath(); break;
    default: ctx.arc(x, y, rad, 0, Math.PI*2);
  }
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // EFEITOS ESPECIAIS - REPLICA O DRAWPAWN
  if (skin.efeito) {
    var time = Date.now() / 1000;

    // Fogo / Dragão / Lava / Vulcão / Inferno / Meteoro / Trovão / Skull
    if (skin.efeito === 'dragon' || skin.efeito === 'fire' || skin.efeito === 'lava' || skin.efeito === 'volcano' || skin.efeito === 'inferno' || skin.efeito === 'meteor' || skin.efeito === 'thunderstorm' || skin.efeito === 'skull') {
      var flameColor1 = skin.efeito === 'thunderstorm' ? '#ffff00' : skin.efeito === 'volcano' ? '#ff4500' : skin.efeito === 'skull' ? '#00ff00' : '#ff4500';
      var flameColor2 = skin.efeito === 'thunderstorm' ? '#808080' : '#ffd700';
      for (var i = 0; i < 15; i++) {
        var angle = time * 3 + i * 0.5;
        var dist = Math.sin(time * 5 + i) * rad * 0.6;
        var fx = x + Math.cos(angle) * dist;
        var fy = y - rad - i * 1.5 + Math.sin(time * 8 + i) * 3;
        ctx.fillStyle = i % 2 === 0 ? flameColor1 : flameColor2;
        ctx.globalAlpha = 0.8 - i * 0.05;
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Buraco Negro
    else if (skin.efeito === 'blackhole') {
      for (var i = 0; i < 20; i++) {
        var a = time * 1.8 + i * (Math.PI * 2 / 20);
        var r1 = rad * 1.2 + Math.sin(time * 3 + i) * rad * 0.1;
        var c1 = x + Math.cos(a) * r1;
        var c2 = y + Math.sin(a) * r1 * 0.55;
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,140,0,0.55)' : 'rgba(180,40,255,0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(c1, c2);
        ctx.lineTo(x + Math.cos(a + 0.15) * (r1 + 5), y + Math.sin(a + 0.15) * (r1 + 5) * 0.55);
        ctx.stroke();
      }
    }

    // Gelo / Dragão de Gelo
    else if (skin.efeito === 'ice' || skin.efeito === 'ice_dragon') {
      for (var i = 0; i < 10; i++) {
        var angle = time * 1.5 + i * 0.63;
        var dist = rad * 1.2;
        var ix = x + Math.cos(angle) * dist;
        var iy = y + Math.sin(angle) * dist;
        ctx.fillStyle = '#e0ffff';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(ix, iy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Sombra
    else if (skin.efeito === 'shadow') {
      for (var i = 0; i < 8; i++) {
        var angle = time * 1.2 + i * 0.8;
        var dist = rad * 1.3;
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + Math.cos(angle) * dist * 0.5, y + Math.sin(angle) * dist * 0.3, x + Math.cos(angle) * dist, y + Math.sin(angle) * dist * 0.6);
        ctx.stroke();
      }
    }

    // Natureza / Floresta
    else if (skin.efeito === 'nature' || skin.efeito === 'floresta') {
      for (var i = 0; i < 10; i++) {
        var angle = time * 0.8 + i * 0.52;
        var dist = rad * 1.2;
        var nx = x + Math.cos(angle) * dist;
        var ny = y + Math.sin(angle) * dist;
        ctx.fillStyle = i % 2 === 0 ? '#32cd32' : '#228b22';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Olho Cósmico
    else if (skin.efeito === 'cosmic_eye') {
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, rad * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ff00ff';
      ctx.beginPath();
      ctx.arc(x, y, rad * 0.2, 0, Math.PI * 2);
      ctx.fill();
      var eyeAngle = time * 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + Math.cos(eyeAngle) * rad * 0.4, y + Math.sin(eyeAngle) * rad * 0.4, rad * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vento
    else if (skin.efeito === 'wind') {
      for (var i = 0; i < 10; i++) {
        var angle = time * 4 + i * (Math.PI * 2 / 10);
        var dist = rad * 1.3;
        var x1 = x + Math.cos(angle) * dist;
        var y1 = y + Math.sin(angle) * dist * 0.5;
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + Math.cos(angle) * 8, y1 + Math.sin(angle) * 4);
        ctx.stroke();
      }
    }

    // Mago Arcano
    else if (skin.efeito === 'arcane_mage') {
      for (var i = 0; i < 5; i++) {
        var angle = time * 1.2 + i * (Math.PI * 2 / 6);
        var dist = rad * 1.3;
        var mx = x + Math.cos(angle) * dist;
        var my = y + Math.sin(angle) * dist;
        ctx.fillStyle = '#8a2be2';
        ctx.globalAlpha = 0.5 + Math.sin(time * 3 + i) * 0.3;
        ctx.font = '8px Arial';
        ctx.fillText('✦', mx, my);
      }
      ctx.globalAlpha = 1;
    }

    // Pandora
    else if (skin.efeito === 'pandora') {
      for (var i = 0; i < 8; i++) {
        var angle = time * 2 + i * 0.63;
        var dist = rad * 1.2;
        var px = x + Math.cos(angle) * dist;
        var py = y + Math.sin(angle) * dist;
        ctx.fillStyle = ['#ffd700','#ff4500','#00ffff','#ff00ff'][i % 4];
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Água / Oceano
    else if (skin.efeito === 'water' || skin.efeito === 'ocean') {
      for (var i = 0; i < 8; i++) {
        var angle = time * 1.5 + i * 0.63;
        var dist = rad * 1.2;
        var wx = x + Math.cos(angle) * dist;
        var wy = y + Math.sin(angle) * dist;
        ctx.fillStyle = '#00bfff';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Deserto
    else if (skin.efeito === 'sand' || skin.efeito === 'deserto') {
      for (var i = 0; i < 8; i++) {
        var angle = time * 2 + i * 0.63;
        var dist = rad * 1.2;
        var sx = x + Math.cos(angle) * dist;
        var sy = y + Math.sin(angle) * dist;
        ctx.fillStyle = '#edc9af';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Céu
    else if (skin.efeito === 'sky' || skin.efeito === 'ceu') {
      for (var i = 0; i < 8; i++) {
        var angle = time * 1.5 + i * 0.8;
        var dist = rad * 1.2;
        var sx = x + Math.cos(angle) * dist;
        var sy = y + Math.sin(angle) * dist * 0.5;
        ctx.fillStyle = '#87ceeb';
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Fantasma / Espectral
    else if (skin.efeito === 'ghost' || skin.efeito === 'espectral') {
      for (var i = 0; i < 5; i++) {
        var angle = time * 1.5 + i * 1.0;
        var dist = rad * 1.2;
        var gx = x + Math.cos(angle) * dist;
        var gy = y + Math.sin(angle) * dist * 0.6;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(gx, gy, 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Coroa / Rei
    else if (skin.efeito === 'crown' || skin.efeito === 'rei') {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(x - rad * 0.6, y - rad * 0.6);
      ctx.lineTo(x - rad * 0.6, y - rad * 1.0);
      ctx.lineTo(x - rad * 0.2, y - rad * 0.8);
      ctx.lineTo(x, y - rad * 1.1);
      ctx.lineTo(x + rad * 0.2, y - rad * 0.8);
      ctx.lineTo(x + rad * 0.6, y - rad * 1.0);
      ctx.lineTo(x + rad * 0.6, y - rad * 0.6);
      ctx.closePath();
      ctx.fill();
    }
  }
}
    function renderSkinsList() {
      var stats = getUserStats(currentUser);
      var list = document.getElementById('skins-list');
      var balance = document.getElementById('skins-balance');
      balance.textContent = 'Pontos: ' + (stats.points || 0);
      list.innerHTML = '';
      var filteredSkins = SKINS.filter(function(skin) {
        if (currentSkinsTab === 'simples') return skin.categoria === 'simples';
        if (currentSkinsTab === 'lendarias') return skin.categoria === 'lendarias';
        if (currentSkinsTab === 'raras') return skin.categoria === 'raras';
        if (currentSkinsTab === 'eventos') return skin.categoria === 'eventos';
        if (currentSkinsTab === 'paises') return skin.categoria === 'paises';
        return false;
      });
      if (filteredSkins.length === 0) {
        list.innerHTML = '<div class="history-empty" style="color:#b8a99a;padding:30px 0;text-align:center;">Nenhuma skin disponível nesta categoria.</div>';
        return;
      }
      for (var i = 0; i < filteredSkins.length; i++) {
        var skin = filteredSkins[i];
        var owned = (stats.ownedSkins || []).indexOf(skin.id) !== -1;
        var equipped = stats.equippedSkin === skin.id;
        var item = document.createElement('div');
        item.className = 'skin-item' + (owned ? ' owned' : '');
        var previewCanvas = document.createElement('canvas');
        previewCanvas.className = 'skin-preview-canvas';
        previewCanvas.style.width = '36px';
        previewCanvas.style.height = '36px';
        drawSkinPreview(previewCanvas, skin);
        previewCanvas._skin = skin;
        var previewSpan = document.createElement('span');
        previewSpan.className = 'skin-preview';
        previewSpan.appendChild(previewCanvas);
        var raridadeHtml = skin.raridade ? '<span class="skin-raridade">' + skin.raridade.toUpperCase() + '</span>' : '';
        item.appendChild(previewSpan);
        var infoDiv = document.createElement('div');
        infoDiv.className = 'skin-info';
        infoDiv.innerHTML = '<div class="skin-name">' + skin.nome + ' ' + raridadeHtml + '</div><div class="skin-price">' + (owned ? (equipped ? 'Equipada' : 'Possuída') : 'Preço: ' + skin.preco + ' pts') + '</div>';
        item.appendChild(infoDiv);
        var btn = document.createElement('button');
        if (!owned) {
          btn.className = 'skin-btn buy';
          btn.textContent = 'Comprar';
          btn.setAttribute('data-skin-id', skin.id);
        } else if (equipped) {
          btn.className = 'skin-btn equipped';
          btn.disabled = true;
          btn.textContent = '✓ Em uso';
        } else {
          btn.className = 'skin-btn equip';
          btn.textContent = 'Equipar';
          btn.setAttribute('data-skin-id', skin.id);
        }
        item.appendChild(btn);
        list.appendChild(item);
      }
      list.querySelectorAll('.skin-btn.buy').forEach(function(btn) {
        btn.addEventListener('click', function(e) { e.stopPropagation(); buySkin(this.getAttribute('data-skin-id')); });
      });
      list.querySelectorAll('.skin-btn.equip').forEach(function(btn) {
        btn.addEventListener('click', function(e) { e.stopPropagation(); equipSkin(this.getAttribute('data-skin-id')); });
      });
    }

    function buySkin(skinId) {
      var stats = getUserStats(currentUser);
      var skin = SKINS.find(function(s) { return s.id === skinId; });
      if (!skin || (stats.ownedSkins || []).indexOf(skinId) !== -1) return;
      if ((stats.points || 0) < skin.preco) { alert('Pontos insuficientes!'); return; }
      stats.points -= skin.preco;
      if (!stats.ownedSkins) stats.ownedSkins = ['classic'];
      stats.ownedSkins.push(skinId);
      updateUserStats(currentUser, stats);
      renderSkinsList();
    }

    function equipSkin(skinId) {
      var stats = getUserStats(currentUser);
      if ((stats.ownedSkins || []).indexOf(skinId) === -1) return;
      stats.equippedSkin = skinId;
      updateUserStats(currentUser, stats);
      renderSkinsList();
      if (document.getElementById('game-screen').classList.contains('active')) draw();
    }

    function openSkins() {
      renderSkinsList();
      document.getElementById('skins-overlay').classList.add('show');
    }
    function closeSkins() {
      document.getElementById('skins-overlay').classList.remove('show');
    }

    document.querySelectorAll('.skin-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.skin-tab').forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        currentSkinsTab = this.getAttribute('data-tab');
        renderSkinsList();
      });
    });

    // ============================================================
    // INSPECT OVERLAY
    // ============================================================
    function openInspect(playerIndex, viewer) {
      var content = document.getElementById('inspect-content');
      content.innerHTML = '';
      var stats = getStats();
      var name = playerIndex === 0 ? G.p1Name : G.p2Name;
      var data = [];

      // ============================================================
      // MODO ONLINE (futuro) — progressão de perfil real
      // ============================================================
      if (typeof isOnlineMode !== 'undefined' && isOnlineMode) {
        data = [
          { label: 'Nome', value: name },
          { label: 'Título', value: stats.equippedTitle || 'Recruta' },
          { label: 'Patente', value: getRank(stats.rankPoints) },
          { label: 'Nível', value: stats.level || 1 },
          { label: 'Partidas', value: stats.games },
          { label: 'Vitórias', value: stats.wins },
          { label: 'Derrotas', value: stats.losses },
          { label: 'Taxa de vitórias', value: (stats.games > 0 ? ((stats.wins / stats.games) * 100).toFixed(1) + '%' : '0%') },
          { label: 'Pontos (ELO)', value: stats.rankPoints.toFixed(1) },
          { label: 'Estilo de jogo', value: stats.games > 0 ? (stats.totalWalls / stats.games >= 4 ? 'Estrategista' : stats.totalWalls / stats.games >= 2 ? 'Equilibrado' : 'Agressivo') : 'Indefinido' }
        ];
      }
      // ============================================================
      // MODO LOCAL — vs IA
      // ============================================================
      else if (G.vsIA) {
        if (playerIndex === 0 && currentUser) {
          var vitoriasIA = stats.expertWins || 0;
          var proximoIA = null, faltamIA = 0;
          if (typeof IA_WINS_TITLES !== 'undefined') {
            for (var i = 0; i < IA_WINS_TITLES.length; i++) {
              if (vitoriasIA < IA_WINS_TITLES[i].minVsIAWins) {
                proximoIA = IA_WINS_TITLES[i].title;
                faltamIA = IA_WINS_TITLES[i].minVsIAWins - vitoriasIA;
                break;
              }
            }
          }
          data = [
            { label: 'Nome', value: name },
            { label: 'Título atual', value: stats.equippedTitle || 'Recruta' },
            { label: 'Vitórias vs IA Expert', value: vitoriasIA },
            { label: 'Próximo título', value: proximoIA ? proximoIA : 'Máximo alcançado' },
            { label: 'Faltam', value: proximoIA ? faltamIA + ' vitória(s)' : '—' }
          ];
        } else {
          // Peão 1 — a IA
          var personalidadeIA = 'padrão';
          try {
            if (typeof CerebroIA !== 'undefined' && CerebroIA.getPersonalidade) {
              personalidadeIA = CerebroIA.getPersonalidade(1);
            }
          } catch (e) {}
          data = [
            { label: 'Nome', value: name },
            { label: 'Tipo', value: 'Inteligência Artificial' },
            { label: 'Dificuldade', value: G.nivelIA.toUpperCase() },
            { label: 'Personalidade', value: personalidadeIA }
          ];
        }
      }
      // ============================================================
      // MODO LOCAL — 2 Jogadores
      // ============================================================
      else {
        var partidasLocais = stats.localGames || 0;
        var proximoLocal = null, faltamLocal = 0;
        if (typeof LOCAL_GAMES_TITLES !== 'undefined') {
          for (var i = 0; i < LOCAL_GAMES_TITLES.length; i++) {
            if (partidasLocais < LOCAL_GAMES_TITLES[i].minLocalGames) {
              proximoLocal = LOCAL_GAMES_TITLES[i].title;
              faltamLocal = LOCAL_GAMES_TITLES[i].minLocalGames - partidasLocais;
              break;
            }
          }
        }
        data = [
          { label: 'Nome', value: name },
          { label: 'Tipo', value: playerIndex === 0 ? 'Você' : 'Jogador Local' },
          { label: 'Partidas 2 Jogadores', value: partidasLocais },
          { label: 'Próximo título', value: proximoLocal ? proximoLocal : 'Máximo alcançado' },
          { label: 'Faltam', value: proximoLocal ? faltamLocal + ' partida(s)' : '—' }
        ];
      }

      for (var i = 0; i < data.length; i++) {
        var item = document.createElement('div');
        item.className = 'inspect-item';
        item.innerHTML = '<span class="label">' + data[i].label + '</span><span class="value">' + data[i].value + '</span>';
        content.appendChild(item);
      }
      var inspectCard = document.getElementById('inspect-card');
      if (G.vsIA && G.turn === 1) {
        inspectCard.classList.add('rotated');
      } else {
        inspectCard.classList.remove('rotated');
      }
      document.getElementById('inspect-overlay').classList.add('show');
    }

    function closeInspect() {
      document.getElementById('inspect-overlay').classList.remove('show');
      document.getElementById('inspect-card').classList.remove('rotated');
    }

    // ============================================================
    // SISTEMA DE XP E PONTOS
    // ============================================================
    function xpParaProximoNivel(nivel) {
      return Math.floor(100 * Math.pow(nivel, 1.5));
    }


    // ============================================================
    // RENDER HISTORY & PROFILE
    // ============================================================
    function renderHistory() {
      var stats = getUserStats(currentUser);
      var list = document.getElementById('history-list');
      list.innerHTML = '';
      if (!stats.history || stats.history.length === 0) {
        list.innerHTML = '<div class="history-empty">Nenhuma partida ainda.</div>';
        return;
      }
      for (var i = 0; i < stats.history.length; i++) {
        var entry = stats.history[i];
        var div = document.createElement('div');
        div.className = 'history-item';
        var date = new Date(entry.date).toLocaleDateString('pt-BR') + ' ' + new Date(entry.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        var resultClass = entry.result === 'Vitória' ? 'win' : 'loss';
        div.innerHTML = '<span class="history-date">' + date + '</span><span class="history-mode">' + entry.mode + '</span><span class="result ' + resultClass + '">' + entry.result + '</span><span class="history-points">' + entry.points.toFixed(1) + '</span>';
        list.appendChild(div);
      }
    }

    function showHistory() {
      document.getElementById('history-overlay').classList.add('show');
      renderHistory();
    }
    function hideHistory() {
      document.getElementById('history-overlay').classList.remove('show');
    }

    // ============================================================
    // PERFIL COMPLETO (com todas as estatísticas)
    // ============================================================
    
    async function logoutUser() {
      try {
        if (firebase.auth().currentUser) {
          await firebase.auth().signOut();
        }
      } catch (e) {
        console.error('Erro ao sair da conta:', e);
      }
      currentUser = null;
      window.currentUserId = null;
      try {
        localStorage.removeItem('quoridor_session_user');
        localStorage.removeItem('quoridor_session_id');
      } catch (e2) {}
      var po = document.getElementById('profile-overlay');
      if (po) po.classList.remove('show');
      if (typeof setLoginUI === 'function') setLoginUI(true);
      if (typeof showScreen === 'function') showScreen('login-screen');
    }

    function openProfile() {
      // mostra userID unico no topo da lista
      try {
        var pl = document.getElementById('profile-list');
        var uid = window.currentUserId || (getAccounts()[currentUser] && getAccounts()[currentUser].uid) || '';
        var idBox = document.getElementById('profile-userid');
        if (idBox) idBox.textContent = uid ? ('ID: ' + uid) : 'ID: —';
      } catch (eProf) {}

      var stats = getUserStats(currentUser);
      if (!stats) { alert("Erro: sem estatísticas"); return; }
      var list = document.getElementById('profile-list');
      if (!list) { alert("Elemento profile-list não encontrado"); return; }
      list.innerHTML = '';

      var avgWalls = stats.games > 0 ? (stats.totalWalls / stats.games) : 0;
      var avgTurns = stats.games > 0 ? (stats.totalTurns / stats.games) : 0;
      var avgPtsWin = stats.wins > 0 ? (stats.sumPointsVictories / stats.wins) : 0;
      var winRate = stats.games > 0 ? ((stats.wins / stats.games) * 100) : 0;
      var ratio = stats.losses > 0 ? (stats.wins / stats.losses) : (stats.wins > 0 ? Infinity : 0);
      var ratioStr = ratio === Infinity ? '∞ : 1' : (ratio.toFixed(1) + ' : 1');
      var avgOppElo = stats.opponentCount > 0 ? Math.round(stats.opponentEloSum / stats.opponentCount) : 'N/A';
      var estilo = avgWalls >= 4 ? 'Estrategista' : avgWalls >= 2 ? 'Equilibrado' : (stats.games > 0 ? 'Agressivo' : 'Indefinido');
      var titulo = stats.equippedTitle || 'Recruta';

      var data = [
        { label: 'Título', value: titulo, desc: getTitleRequirement(titulo) },
        { label: 'Patente Atual', value: getRank(stats.rankPoints), desc: 'Sua patente atual no sistema ranqueado.' },
        { label: 'Nível', value: stats.level || 1, desc: 'Nível atual do jogador. Máximo: 100.' },
        { label: 'XP total', value: stats.xp || 0, desc: 'Experiência acumulada.' },
        { label: 'Progresso de nível', value: stats.level >= 100 ? 'MAX' : (stats.xp || 0) + ' / ' + xpParaProximoNivel(stats.level), desc: 'Progresso para o próximo nível.' },
        { label: 'Total de partidas', value: stats.games, desc: 'Veterania. Um número alto já impõe respeito.' },
        { label: 'Total de vitórias', value: stats.wins, desc: 'Volume de sucesso.' },
        { label: 'Total de derrotas', value: stats.losses || 0, desc: 'Resiliência.' },
        { label: 'Taxa de vitórias (%)', value: winRate.toFixed(1) + '%', desc: 'A verdade nua e crua.' },
        { label: 'Pontuação atual (ELO)', value: (stats.rankPoints || 0).toFixed(1), desc: 'O momento.' },
        { label: 'Maior pontuação já alcançada', value: (stats.maxRankPoints || 0).toFixed(1), desc: 'O teto.' },
        { label: 'Sequência atual de vitórias', value: stats.streak || 0, desc: 'A fase.' },
        { label: 'Maior sequência da carreira', value: stats.maxStreak || 0, desc: 'Pico de dominância.' },
        { label: 'Estilo de jogo', value: estilo, desc: 'Estrategista: 4+ paredes. Equilibrado: 2-3. Agressivo: <2.' },
        { label: 'Média de turnos por partida', value: avgTurns.toFixed(1), desc: 'Paciência vs. Pressa.' },
        { label: 'Total de paredes na carreira', value: stats.totalWalls || 0, desc: 'Dedicação tática.' },
        { label: 'Média de pontos por vitória', value: avgPtsWin.toFixed(1), desc: 'Qualidade das vitórias.' },
        { label: 'Razão Vitória/Derrota', value: ratioStr, desc: 'Quantas vitórias para cada derrota.' },
        { label: 'Melhor rank já alcançado', value: getRank(stats.maxRankPoints || 0), desc: 'Potencial máximo.' },
        { label: 'Média de ELO dos oponentes', value: avgOppElo, desc: 'Nível dos desafios.' }
      ];

      for (var i = 0; i < data.length; i++) {
        var s = data[i];
        var item = document.createElement('div');
        item.className = 'profile-item';
        item.innerHTML = '<span class="stat-label"><span class="info-icon">i</span>' + s.label + '</span><span class="stat-value">' + s.value + '</span><div class="stat-desc">' + s.desc + '</div>';
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var wasActive = this.classList.contains('active');
          document.querySelectorAll('.profile-item').forEach(function(el) { el.classList.remove('active'); });
          if (!wasActive) this.classList.add('active');
        });
        list.appendChild(item);
      }

      renderMedalsInProfile(list, stats);
      document.getElementById('profile-overlay').classList.add('show');
    }

    function closeProfile() {
      document.getElementById('profile-overlay').classList.remove('show');
      document.querySelectorAll('.profile-item').forEach(function(el) { el.classList.remove('active'); });
    }

    function getTitleRequirement(title) {
      if (title === 'Recruta') return 'Título inicial.';
      var arrays = [TITLES, SEQUENCE_TITLES, GAMES_PLAYED_TITLES, LEVEL_TITLES, LOCAL_GAMES_TITLES, IA_WINS_TITLES];
      var keys = ['minWins', 'minStreak', 'minGames', 'level', 'minLocalGames', 'minVsIAWins'];
      var labels = ['vitórias', 'sequência de vitórias', 'partidas jogadas', 'nível', 'partidas locais', 'vitórias vs IA Expert'];
      for (var a = 0; a < arrays.length; a++) {
        for (var i = 0; i < arrays[a].length; i++) {
          if (arrays[a][i].title === title) return 'Conquistado com ' + arrays[a][i][keys[a]] + ' ' + labels[a] + '.';
        }
      }
      return 'Requisito desconhecido.';
    }

    // ============================================================
    // MEDALS OVERLAY
    // ============================================================
    function openMedals() {
      var stats = getUserStats(currentUser);
      var list = document.getElementById('medals-list');
      list.innerHTML = '';
      for (var i = 0; i < MEDALS.length; i++) {
        var medal = MEDALS[i];
        var unlocked = medal.check(stats);
        var item = document.createElement('div');
        item.className = 'medal-item ' + (unlocked ? 'unlocked' : 'locked');
        item.innerHTML = '<span class="medal-svg">' + medal.svg(unlocked) + '</span><div class="medal-info"><div class="medal-name">' + medal.nome + '</div><div class="medal-req">' + medal.desc + '</div></div><span class="title-status">' + (unlocked ? '✔' : '') + '</span>';
        list.appendChild(item);
      }
      document.getElementById('medals-overlay').classList.add('show');
    }

    function closeMedals() {
      document.getElementById('medals-overlay').classList.remove('show');
    }

    // ============================================================
    // RANKS OVERLAY
    // ============================================================
    function openRanks() {
      var stats = getUserStats(currentUser);
      var points = stats.rankPoints || 0;
      var atual = obterPatente(points);
      var proxima = obterProximaPatente(points);
      var progresso = obterProgresso(points);
      document.getElementById('ranks-progress').innerHTML =
        '<div class="progress-info"><span>' + atual.nomeCompleto + '</span><span>' + (proxima || 'MAX') + '</span></div>' +
        '<div class="progress-info"><span>' + points.toFixed(1) + ' pts</span><span>' + progresso.toFixed(0) + '%</span></div>' +
        '<div class="progress-bar"><div class="fill" style="width:' + progresso + '%"></div></div>';
      var list = document.getElementById('ranks-list');
      list.innerHTML = '';
      for (var i = 0; i < PATENTES.length; i++) {
        var p = PATENTES[i];
        var isCurrent = p.nome === atual.nome;
        var item = document.createElement('div');
        item.className = 'rank-item' + (isCurrent ? ' current' : '');
        item.innerHTML = '<span class="rank-name">' + p.nome + '</span><span class="rank-range">' + (isCurrent ? 'ATUAL' : '') + '</span>';
        list.appendChild(item);
      }
      document.getElementById('ranks-overlay').classList.add('show');
    }

    function closeRanks() {
      document.getElementById('ranks-overlay').classList.remove('show');
    }

    // ============================================================
    // SALA ONLINE (FIREBASE) - VERSÃO SEM ORDERBY (CORRIGIDA)
    // ============================================================
    var salaAtual = null;
    var salaUnsubscribe = null;
    var isOnlineMode = false;
    var filaUnsubscribe = null;
    var jogadorNaFila = false;
    var listaSalasUnsubscribe = null;

    function euSouJogadorDaVez() {
      if (!isOnlineMode) return true;
      if (G.turn === 0) return currentUser === G.p1Name;
      return currentUser === G.p2Name;
    }

    function limparOnline() {
      if (salaUnsubscribe) { try { salaUnsubscribe(); } catch(e) {} salaUnsubscribe = null; }
      if (filaUnsubscribe) { try { filaUnsubscribe(); } catch(e) {} filaUnsubscribe = null; }
      if (listaSalasUnsubscribe) { try { listaSalasUnsubscribe(); } catch(e) {} listaSalasUnsubscribe = null; }
      jogadorNaFila = false;
      isOnlineMode = false;
      salaAtual = null;
      if (G) { G.online = false; G.salald = null; }
    }

    function paredesFirestoreParaLocal(paredesH, paredesV) {
      var pH = [], pV = [], owH = [], owV = [];
      (paredesH || []).forEach(function(w) {
        if (Array.isArray(w)) { pH.push([w[0], w[1]]); owH.push(0); }
        else if (w && typeof w.r === 'number') { pH.push([w.r, w.c]); owH.push(typeof w.dono === 'number' ? w.dono : 0); }
      });
      (paredesV || []).forEach(function(w) {
        if (Array.isArray(w)) { pV.push([w[0], w[1]]); owV.push(0); }
        else if (w && typeof w.r === 'number') { pV.push([w.r, w.c]); owV.push(typeof w.dono === 'number' ? w.dono : 0); }
      });
      return { pH: pH, pV: pV, owH: owH, owV: owV };
    }

    function paredesLocalParaFirestore() {
      var paredesH = [], paredesV = [];
      for (var i = 0; i < G.pH.length; i++) {
        paredesH.push({ r: G.pH[i][0], c: G.pH[i][1], dono: G.wallOwnerH[i] != null ? G.wallOwnerH[i] : 0 });
      }
      for (var j = 0; j < G.pV.length; j++) {
        paredesV.push({ r: G.pV[j][0], c: G.pV[j][1], dono: G.wallOwnerV[j] != null ? G.wallOwnerV[j] : 0 });
      }
      return { paredesH: paredesH, paredesV: paredesV };
    }

    function aplicarEstadoSala(data) {
      if (!data) return;
      G.p1Name = data.jogador1 || G.p1Name;
      G.p2Name = data.jogador2 || G.p2Name || 'Aguardando...';
      if (data.posicoes && data.posicoes.length === 2) {
        G.pos = [[data.posicoes[0][0], data.posicoes[0][1]], [data.posicoes[1][0], data.posicoes[1][1]]];
      }
      var pw = paredesFirestoreParaLocal(data.paredesH, data.paredesV);
      G.pH = pw.pH; G.pV = pw.pV; G.wallOwnerH = pw.owH; G.wallOwnerV = pw.owV;
      G.walls = data.paredesRestantes ? data.paredesRestantes.slice() : [10,10];
      G.turn = typeof data.turno === 'number' ? data.turno : 0;
      G.vsIA = false;
      G.online = true;
      document.getElementById('p1-nome').textContent = G.p1Name;
      document.getElementById('nomeJ2').textContent = G.p2Name;
      document.getElementById('placar-p1').textContent = G.p1Name;
      document.getElementById('placar-p2').textContent = G.p2Name;
      var p2c = document.getElementById('p2-controls');
      if (p2c) p2c.style.display = 'none';
      document.getElementById('game-screen').classList.remove('p2-active', 'modo-2p');
      document.getElementById('hud-wrapper').classList.remove('rotated');
      if (typeof updateWallIndicators === 'function') updateWallIndicators();
      if (typeof syncBtn === 'function') syncBtn();
      if (typeof draw === 'function') draw();
      if (typeof st === 'function') {
        if (G.over) return;
        if (euSouJogadorDaVez()) st('Sua vez: ' + (G.turn === 0 ? G.p1Name : G.p2Name));
        else st('Aguardando oponente...');
      }
    }

    function criarSala(nomeJogador, senha) {
      var salaRef = db.collection('salas').doc();
      var salald = salaRef.id;
      var dados = {
        jogador1: nomeJogador,
        jogador2: '',
        status: 'esperando',
        turno: 0,
        posicoes: [[8,4],[0,4]],
        paredesH: [],
        paredesV: [],
        paredesRestantes: [10,10],
        vencedor: '',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        senha: senha || ''
      };
      salaRef.set(dados).then(function() {
        document.getElementById('sala-status').innerHTML = 'Sala criada! Aguardando oponente...<br><small>ID: ' + salald + '</small>';
        isOnlineMode = true;
        salaAtual = salald;
        G.online = true;
        G.salald = salald;
        G.p1Name = nomeJogador;
        G.p2Name = 'Aguardando...';
        if (salaUnsubscribe) salaUnsubscribe();
        salaUnsubscribe = salaRef.onSnapshot(function(doc) {
          if (!doc.exists) return;
          var data = doc.data();
          if (data.status === 'em_andamento' && data.jogador2) {
            document.getElementById('sala-overlay').classList.remove('show');
            iniciarJogoOnline(salald, nomeJogador, data);
          } else if (data.status === 'esperando') {
            document.getElementById('sala-status').textContent = 'Aguardando oponente entrar...';
          }
        });
      }).catch(function(err) {
        document.getElementById('sala-status').textContent = '❌ Erro ao criar sala: ' + err.message;
      });
    }

    function entrarSala(salald, nomeJogador, isCriador, senhaFornecida) {
      var salaRef = db.collection('salas').doc(salald);
      salaRef.get().then(function(doc) {
        if (!doc.exists) {
          document.getElementById('sala-status').textContent = '❌ Sala não encontrada.';
          return;
        }
        var data = doc.data();
        if (data.status === 'finalizada') {
          document.getElementById('sala-status').textContent = '❌ Sala já finalizada.';
          return;
        }
        if (data.senha && data.senha !== '' && !isCriador) {
          if (senhaFornecida !== data.senha) {
            document.getElementById('sala-status').textContent = '❌ Senha incorreta.';
            return;
          }
        }
        if (data.jogador1 === nomeJogador || data.jogador2 === nomeJogador) {
          document.getElementById('sala-overlay').classList.remove('show');
          iniciarJogoOnline(salald, nomeJogador, data);
          return;
        }
        if (data.jogador2 && data.jogador2 !== '') {
          document.getElementById('sala-status').textContent = '❌ Sala cheia.';
          return;
        }
        salaRef.update({ jogador2: nomeJogador, status: 'em_andamento' })
          .then(function() { return salaRef.get(); })
          .then(function(doc2) {
            document.getElementById('sala-overlay').classList.remove('show');
            iniciarJogoOnline(salald, nomeJogador, doc2.data());
          })
          .catch(function(err) {
            document.getElementById('sala-status').textContent = '❌ Erro ao entrar: ' + err.message;
          });
      }).catch(function(err) {
        document.getElementById('sala-status').textContent = '❌ Erro ao buscar sala: ' + err.message;
      });
    }

    function entrarSalaComSenha(salald, nomeJogador) {
      var salaRef = db.collection('salas').doc(salald);
      salaRef.get().then(function(doc) {
        if (!doc.exists) return;
        var data = doc.data();
        if (data.senha && data.senha !== '') {
          var senhaDigitada = prompt('Digite a senha da sala:');
          if (senhaDigitada === null) return;
          entrarSala(salald, nomeJogador, false, senhaDigitada);
        } else {
          entrarSala(salald, nomeJogador, false, '');
        }
      });
    }

    function iniciarJogoOnline(salald, nomeJogador, data) {
      isOnlineMode = true;
      salaAtual = salald;
      G.online = true;
      G.salald = salald;
      G.vsIA = false;
      G.over = false;
      G.mode = 'move';
      G.sel = null;
      G.moves = [];
      gameActive = true;
      matchFinished = false;
      aplicarEstadoSala(data);
      showScreen('game-screen');
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          if (typeof resize === 'function') resize();
          aplicarEstadoSala(data);
          if (euSouJogadorDaVez() && typeof selectPawn === 'function') {
            selectPawn(G.pos[G.turn][0], G.pos[G.turn][1]);
          }
        });
      });
      if (salaUnsubscribe) salaUnsubscribe();
      salaUnsubscribe = db.collection('salas').doc(salald).onSnapshot(function(doc) {
        if (!doc.exists) return;
        var novoData = doc.data();
        if (novoData.status === 'finalizada') {
          if (!G.over) {
            G.over = true;
            var vencedor = novoData.vencedor === G.p1Name ? 0 : (novoData.vencedor === G.p2Name ? 1 : -1);
            if (vencedor !== -1 && typeof showWinOverlay === 'function') {
              showWinOverlay('🏆 ' + novoData.vencedor + ' venceu!', vencedor);
            }
          }
          return;
        }
        aplicarEstadoSala(novoData);
        if (euSouJogadorDaVez() && !G.over && typeof selectPawn === 'function') {
          selectPawn(G.pos[G.turn][0], G.pos[G.turn][1]);
        }
      });
    }

    function enviarJogadaOnline(jogada) {
      if (!salaAtual || !isOnlineMode) return;
      if (!euSouJogadorDaVez()) return;
      var salaRef = db.collection('salas').doc(salaAtual);
      var paredes = paredesLocalParaFirestore();
      var posicoes = [[G.pos[0][0], G.pos[0][1]], [G.pos[1][0], G.pos[1][1]]];
      var paredesRestantes = [G.walls[0], G.walls[1]];
      var turno = G.turn;
      var update = {
        posicoes: posicoes,
        paredesH: paredes.paredesH,
        paredesV: paredes.paredesV,
        paredesRestantes: paredesRestantes,
        turno: turno
      };
      if (G.over || (G.pos[0][0] === 0) || (G.pos[1][0] === 8)) {
        update.status = 'finalizada';
        update.vencedor = (G.pos[0][0] === 0) ? G.p1Name : G.p2Name;
      }
      salaRef.update(update).catch(function(err) {
        console.error('Erro ao enviar jogada:', err);
        if (typeof st === 'function') st('Erro de sincronização. Tente de novo.');
      });
    }

    function listarSalasAbertas() {
      if (listaSalasUnsubscribe) {
        try { listaSalasUnsubscribe(); } catch(e) {}
        listaSalasUnsubscribe = null;
      }

      var statusEl = document.getElementById('sala-status');
      if (statusEl) statusEl.textContent = '🔄 Carregando salas...';

      listaSalasUnsubscribe = db.collection('salas')
        .where('status', '==', 'esperando')
        .onSnapshot(function(snapshot) {
          var lista = document.getElementById('sala-lista');
          if (!lista) return;
          lista.innerHTML = '';

          if (snapshot.empty) {
            lista.innerHTML = '<div class="history-empty" style="padding:20px;text-align:center;color:#666;">📭 Nenhuma sala aberta.<br>Crie uma para começar!</div>';
            if (statusEl) statusEl.textContent = '💡 Nenhuma sala disponível. Crie uma!';
            return;
          }

          if (statusEl) statusEl.textContent = '📋 ' + snapshot.size + ' sala(s) disponível(eis)';

          snapshot.forEach(function(doc) {
            var data = doc.data();
            var el = document.createElement('div');
            el.className = 'sala-item';
            el.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid rgba(255,215,140,0.06);';

            var cadeado = data.senha && data.senha !== '' ? '🔒' : '🔓';
            var jogador = data.jogador1 || 'Anônimo';

            el.innerHTML =
              '<span style="color:#f0e6d3;font-weight:bold;">' + jogador + ' ' + cadeado + '</span>' +
              '<span style="color:#b8a99a;font-size:12px;">1/2</span>' +
              '<button class="sala-btn" data-id="' + doc.id + '" style="background:rgba(212,163,115,0.15);border:1px solid #d4a373;color:#d4a373;border-radius:8px;padding:6px 16px;font-weight:bold;cursor:pointer;">Entrar</button>';

            lista.appendChild(el);
          });

          lista.querySelectorAll('.sala-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
              var id = this.getAttribute('data-id');
              if (!currentUser) {
                alert('Faça login primeiro.');
                return;
              }
              entrarSalaComSenha(id, currentUser);
            });
          });

        }, function(error) {
          console.error('Erro ao listar salas:', error);
          if (statusEl) statusEl.textContent = '❌ Erro ao carregar salas. Tente novamente.';
          var lista = document.getElementById('sala-lista');
          if (lista) {
            lista.innerHTML = '<div style="color:#e06b6b;padding:20px;text-align:center;">❌ Erro ao carregar salas.<br><small>' + error.message + '</small></div>';
          }
        });
    }

    // ============================================================
    // LÓGICA DO JOGO (TABULEIRO, IA, TIMER, ETC.) - COMPLETA
    // ============================================================
    var N=9, WALLS=10, WIN=[0,8], SCALE=2;
    var C = [
      {main: '#d4a373', dark: '#b8860b', light: '#f0d5b0', glow: 'rgba(212,163,115,0.8)', dot: 'rgba(212,163,115,0.75)', dotHov: '#d4a373', wallFill: '#d4a373', wallShadow: 'rgba(184,134,11,0.6)'},
      {main: '#4dabf7', dark: '#1a6bb5', light: '#a8d8ff', glow: 'rgba(77,171,247,0.8)', dot: 'rgba(77,171,247,0.75)', dotHov: '#4dabf7', wallFill: '#4dabf7', wallShadow: 'rgba(77,171,247,0.6)'}
    ];
    var G = {pos: [[8,4],[0,4]], walls: [WALLS, WALLS], turn: 0, pH: [], pV: [], wallOwnerH: [], wallOwnerV: [], hist: [], over: false, sel: null, moves: [], mode: 'move', validH: [], validV: [], hoverNode: null, nivelIA: 'medio', iaThinking: false, p1Name: 'Player 1', p2Name: 'Player 2', vsIA: false, online: false, salald: null};
    var config = {time: 30, rounds: 1};
    var scores = [0,0], currentRound = 1;
    var timerInterval = null, currentTime = 30, timerRunning = false;
    var gameActive = false, resetPending = false, matchFinished = false;
    var seriesStats = {userWalls: 0, userMoves: 0};
    var canvas = document.getElementById('board'), ctx = canvas.getContext('2d');
    var statusEl = document.getElementById('status'), timerDisplayEl = document.getElementById('timer-display'), iaTh = document.getElementById('ia-thinking');
    var SZ, GAP, PAT, BOARD, autoResetTimer=null, autoResetTimer2=null;
    var positionHistory = [];

    function getStats() {
      if (currentUser) {
        var s = getUserStats(currentUser);
        return {games: s.games, wins: s.wins, losses: s.losses || 0, streak: s.streak || 0, maxStreak: s.maxStreak || 0, rankPoints: s.rankPoints || 0, maxRankPoints: s.maxRankPoints || 0, history: s.history || [], totalWalls: s.totalWalls || 0, totalTurns: s.totalTurns || 0, sumPointsVictories: s.sumPointsVictories || 0, opponentEloSum: s.opponentEloSum || 0, opponentCount: s.opponentCount || 0, level: s.level || 1, xp: s.xp || 0, equippedTitle: s.equippedTitle || 'Recruta', ownedSkins: s.ownedSkins || ['classic'], equippedSkin: s.equippedSkin || 'classic', localGames: s.localGames || 0, expertWins: s.expertWins || 0, medals: s.medals || []};
      }
      return {games:0,wins:0,losses:0,streak:0,maxStreak:0,rankPoints:0,maxRankPoints:0,history:[],totalWalls:0,totalTurns:0,sumPointsVictories:0,opponentEloSum:0,opponentCount:0,level:1,xp:0,equippedTitle:'Recruta', ownedSkins:['classic'], equippedSkin:'classic', localGames:0, expertWins:0, medals:[]};
    }

    function saveStats(stats) {
      if (!currentUser) return; // estatísticas ignoradas (sem usuário)
      var userStats = getUserStats(currentUser);
      userStats.games = stats.games;
      userStats.wins = stats.wins;
      userStats.losses = stats.losses;
      userStats.streak = stats.streak;
      userStats.maxStreak = stats.maxStreak;
      userStats.rankPoints = stats.rankPoints;
      userStats.maxRankPoints = stats.maxRankPoints;
      userStats.history = stats.history;
      userStats.totalWalls = stats.totalWalls;
      userStats.totalTurns = stats.totalTurns;
      userStats.sumPointsVictories = stats.sumPointsVictories;
      userStats.opponentEloSum = stats.opponentEloSum;
      userStats.opponentCount = stats.opponentCount;
      userStats.level = stats.level;
      userStats.xp = stats.xp;
      userStats.equippedTitle = stats.equippedTitle || 'Recruta';
      userStats.ownedSkins = stats.ownedSkins || ['classic'];
      userStats.equippedSkin = stats.equippedSkin || 'classic';
      userStats.localGames = stats.localGames || 0;
      userStats.expertWins = stats.expertWins || 0;
      userStats.medals = stats.medals || [];
      updateUserStats(currentUser, userStats);
    }

    function drawPawn(p, x, y, rad, active, rotateText) {
      var skinId = null;
      if (p === 0 && currentUser) {
        var stats = getStats();
        skinId = stats.equippedSkin || 'classic';
      }
      var skin = null;
      if (skinId) {
        for (var i = 0; i < SKINS.length; i++) {
          if (SKINS[i].id === skinId) { skin = SKINS[i]; break; }
        }
      }
      var time = Date.now() / 1000;
      if (skin && (skin.raridade === 'lendaria' || skin.raridade === 'rara')) {
        var pulse = Math.sin(time * 3) * 0.3 + 0.7;
        ctx.shadowColor = skin.cor1;
        ctx.shadowBlur = 22 * pulse;
        if (skin.efeito === 'dragon') {
          for(var i = 0; i < 18; i++) {
            var angle = time * 2.5 + i * 0.35;
            var dist = Math.sin(time * 4 + i) * rad * 0.7 + rad * 0.3;
            var fx = x + Math.cos(angle) * dist * 0.6;
            var fy = y - rad * 0.9 - i * 1.8 + Math.sin(time * 6 + i) * 4;
            var sz = 2.2 + Math.sin(time * 5 + i) * 1.2;
            ctx.fillStyle = i % 3 === 0 ? '#ffd700' : (i % 3 === 1 ? '#ff4500' : '#ff2200');
            ctx.globalAlpha = 0.85 - i * 0.04;
            ctx.beginPath();
            ctx.arc(fx, fy, sz, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = '#ff6600';
          ctx.beginPath();
          ctx.arc(x, y, rad * 1.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (skin.efeito === 'blackhole') {
          for(var i = 0; i < 36; i++) {
            var a = time * 1.8 + i * (Math.PI * 2 / 36);
            var r1 = rad * 1.15 + Math.sin(time * 3 + i) * rad * 0.08;
            var r2 = rad * 1.55 + Math.cos(time * 2.5 + i) * rad * 0.12;
            var c1 = x + Math.cos(a) * r1;
            var c2 = y + Math.sin(a) * r1 * 0.55;
            var c3 = x + Math.cos(a + 0.15) * r2;
            var c4 = y + Math.sin(a + 0.15) * r2 * 0.55;
            ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,140,0,0.55)' : 'rgba(180,40,255,0.45)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(c1, c2);
            ctx.lineTo(c3, c4);
            ctx.stroke();
          }
          ctx.strokeStyle = 'rgba(255,200,80,0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(x, y, rad * 1.05, rad * 0.55, 0, 0, Math.PI * 2);
          ctx.stroke();
          for(var i = 0; i < 10; i++) {
            var oa = time * 2.2 + i * 0.63;
            var orad = rad * 1.35 + Math.sin(time + i) * 3;
            var px = x + Math.cos(oa) * orad;
            var py = y + Math.sin(oa) * orad * 0.5;
            ctx.fillStyle = i % 2 === 0 ? '#ffaa33' : '#cc66ff';
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          var hg = ctx.createRadialGradient(x, y, 0, x, y, rad * 0.95);
          hg.addColorStop(0, '#000000');
          hg.addColorStop(0.55, '#0a0510');
          hg.addColorStop(0.85, '#1a0030');
          hg.addColorStop(1, 'rgba(40,0,60,0.3)');
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.arc(x, y, rad * 0.95, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,180,100,0.35)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, rad * 1.02, 0, Math.PI * 2);
          ctx.stroke();
        } else if (skin.efeito === 'fire' || skin.efeito === 'thunderstorm' || skin.efeito === 'volcano' || skin.efeito === 'skull' || skin.efeito === 'inferno' || skin.efeito === 'lava' || skin.efeito === 'meteor') {
          var flameColor1 = skin.efeito === 'thunderstorm' ? '#ffff00' : skin.efeito === 'volcano' ? '#ff4500' : skin.efeito === 'skull' ? '#00ff00' : skin.efeito === 'inferno' ? '#ff0000' : skin.efeito === 'lava' ? '#ff4500' : skin.efeito === 'meteor' ? '#ff8c00' : '#ff4500';
          var flameColor2 = skin.efeito === 'thunderstorm' ? '#808080' : skin.efeito === 'volcano' ? '#8b0000' : skin.efeito === 'skull' ? '#ff00ff' : skin.efeito === 'inferno' ? '#8b0000' : skin.efeito === 'lava' ? '#8b0000' : skin.efeito === 'meteor' ? '#8b0000' : '#ffd700';
          for(var i = 0; i < 12; i++) {
            var angle = time * 3 + i * 0.5;
            var dist = Math.sin(time * 5 + i) * rad * 0.6;
            var fx = x + Math.cos(angle) * dist;
            var fy = y - rad - i * 2 + Math.sin(time * 8 + i) * 3;
            ctx.fillStyle = i % 2 === 0 ? flameColor1 : flameColor2;
            ctx.globalAlpha = 0.8 - i * 0.05;
            ctx.beginPath();
            ctx.arc(fx, fy, 2 + Math.sin(time + i) * 1, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else if (skin.efeito === 'ice' || skin.efeito === 'ice_dragon') {
          for(var i = 0; i < 10; i++) {
            var angle = time * 1.5 + i * 0.63;
            var dist = rad * 1.1 + Math.sin(time * 2 + i) * rad * 0.3;
            var ix = x + Math.cos(angle) * dist;
            var iy = y + Math.sin(angle) * dist;
            ctx.fillStyle = '#e0ffff';
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(ix, iy, 2 + Math.sin(time + i) * 1, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else if (skin.efeito === 'shadow') {
          for(var i = 0; i < 8; i++) {
            var angle = time * 1.2 + i * 0.8;
            var dist = rad * 1.2 + Math.sin(time * 3 + i) * rad * 0.4;
            var sx = x + Math.cos(angle) * dist;
            var sy = y + Math.sin(angle) * dist * 0.6;
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + Math.cos(angle) * dist * 0.5, y + Math.sin(angle) * dist * 0.3, sx, sy);
            ctx.stroke();
          }
        } else if (skin.efeito === 'nature' || skin.efeito === 'floresta') {
          for(var i = 0; i < 12; i++) {
            var angle = time * 0.8 + i * 0.52;
            var dist = rad * 1.1 + Math.sin(time * 2 + i) * rad * 0.4;
            var nx = x + Math.cos(angle) * dist;
            var ny = y + Math.sin(angle) * dist;
            ctx.fillStyle = i % 2 === 0 ? '#32cd32' : '#228b22';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else if (skin.efeito === 'cosmic_eye') {
          ctx.strokeStyle = '#ff00ff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, rad * 1.2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#ff00ff';
          ctx.beginPath();
          ctx.arc(x, y, rad * 0.2, 0, Math.PI * 2);
          ctx.fill();
          var eyeAngle = time * 2;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + Math.cos(eyeAngle) * rad * 0.4, y + Math.sin(eyeAngle) * rad * 0.4, rad * 0.15, 0, Math.PI * 2);
          ctx.fill();
        } else if (skin.efeito === 'wind') {
          for(var i = 0; i < 12; i++) {
            var angle = time * 4 + i * (Math.PI * 2 / 12);
            var dist = rad * 1.2 + Math.sin(time * 8 + i) * rad * 0.3;
            var x1 = x + Math.cos(angle) * dist;
            var y1 = y + Math.sin(angle) * dist * 0.5;
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + Math.cos(angle) * 10, y1 + Math.sin(angle) * 5);
            ctx.stroke();
          }
        } else if (skin.efeito === 'arcane_mage') {
          for(var i = 0; i < 6; i++) {
            var angle = time * 1.2 + i * (Math.PI * 2 / 6);
            var dist = rad * 1.3;
            var mx = x + Math.cos(angle) * dist;
            var my = y + Math.sin(angle) * dist;
            ctx.fillStyle = '#8a2be2';
            ctx.globalAlpha = 0.5 + Math.sin(time * 3 + i) * 0.3;
            ctx.font = '10px Arial';
            ctx.fillText('✦', mx, my);
          }
          ctx.globalAlpha = 1;
        } else if (skin.efeito === 'pandora') {
          for(var i = 0; i < 10; i++) {
            var angle = time * 2 + i * 0.63;
            var dist = rad * 1.2 + Math.sin(time * 5 + i) * rad * 0.5;
            var px = x + Math.cos(angle) * dist;
            var py = y + Math.sin(angle) * dist;
            ctx.fillStyle = ['#ffd700','#ff4500','#00ffff','#ff00ff'][i % 4];
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else if (skin.efeito === 'serpent') {
          for(var i = 0; i < 8; i++) {
            var angle = time * 1.5 + i * 0.8;
            var dist = rad * 1.1;
            var sx = x + Math.cos(angle) * dist;
            var sy = y + Math.sin(angle) * dist;
            ctx.strokeStyle = '#32cd32';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + Math.cos(angle) * dist * 0.5, y + Math.sin(angle) * dist * 0.3, sx, sy);
            ctx.stroke();
          }
        } else if (skin.efeito === 'water' || skin.efeito === 'ocean') {
          for(var i = 0; i < 10; i++) {
            var angle = time * 1.5 + i * 0.63;
            var dist = rad * 1.1 + Math.sin(time * 2 + i) * rad * 0.3;
            var wx = x + Math.cos(angle) * dist;
            var wy = y + Math.sin(angle) * dist;
            ctx.fillStyle = '#00bfff';
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else if (skin.efeito === 'sand' || skin.efeito === 'deserto') {
          for(var i = 0; i < 10; i++) {
            var angle = time * 2 + i * 0.63;
            var dist = rad * 1.1 + Math.sin(time * 3 + i) * rad * 0.3;
            var sx = x + Math.cos(angle) * dist;
            var sy = y + Math.sin(angle) * dist;
            ctx.fillStyle = '#edc9af';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else if (skin.efeito === 'sky' || skin.efeito === 'ceu') {
          for(var i = 0; i < 8; i++) {
            var angle = time * 1.5 + i * 0.8;
            var dist = rad * 1.2;
            var sx = x + Math.cos(angle) * dist;
            var sy = y + Math.sin(angle) * dist * 0.5;
            ctx.fillStyle = '#87ceeb';
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(sx, sy, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else if (skin.efeito === 'ghost' || skin.efeito === 'espectral') {
          for(var i = 0; i < 6; i++) {
            var angle = time * 1.5 + i * 1.0;
            var dist = rad * 1.1;
            var gx = x + Math.cos(angle) * dist;
            var gy = y + Math.sin(angle) * dist * 0.6;
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(gx, gy, 3, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else if (skin.efeito === 'crown' || skin.efeito === 'rei') {
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.moveTo(x - rad * 0.6, y - rad * 0.6);
          ctx.lineTo(x - rad * 0.6, y - rad * 1.0);
          ctx.lineTo(x - rad * 0.2, y - rad * 0.8);
          ctx.lineTo(x, y - rad * 1.1);
          ctx.lineTo(x + rad * 0.2, y - rad * 0.8);
          ctx.lineTo(x + rad * 0.6, y - rad * 1.0);
          ctx.lineTo(x + rad * 0.6, y - rad * 0.6);
          ctx.closePath();
          ctx.fill();
        }
      }

      if (skin && p === 0) {
        var cor1 = skin.cor1, cor2 = skin.cor2;
        if (skin.efeito === 'blackhole') {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold ' + Math.round(rad * 0.75) + 'px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (rotateText) { ctx.save(); ctx.translate(x,y); ctx.rotate(Math.PI); ctx.fillText(String(p+1), 0, 0); ctx.restore(); }
          else ctx.fillText(String(p+1), x, y);
          ctx.shadowBlur = 0;
          return;
        }
        var grad = ctx.createRadialGradient(x - rad*0.3, y - rad*0.35, rad*0.05, x, y, rad);
        grad.addColorStop(0, cor1);
        grad.addColorStop(1, cor2);
        ctx.fillStyle = grad;
        ctx.strokeStyle = active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = active ? 2 : 1;
        ctx.beginPath();
        if (skin.forma === 'dragon') {
          ctx.ellipse(x, y + rad*0.1, rad*0.75, rad*0.9, 0, 0, Math.PI*2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x - rad*0.3, y);
          ctx.quadraticCurveTo(x - rad*1.4, y - rad*0.8, x - rad*0.5, y - rad*1.1);
          ctx.quadraticCurveTo(x - rad*0.9, y - rad*0.3, x - rad*0.3, y);
          ctx.fillStyle = cor2;
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x + rad*0.3, y);
          ctx.quadraticCurveTo(x + rad*1.4, y - rad*0.8, x + rad*0.5, y - rad*1.1);
          ctx.quadraticCurveTo(x + rad*0.9, y - rad*0.3, x + rad*0.3, y);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(x, y - rad*0.55, rad*0.45, rad*0.35, 0, 0, Math.PI*2);
          ctx.fillStyle = cor1;
          ctx.fill();
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - rad*0.2, y - rad*0.75);
          ctx.lineTo(x - rad*0.35, y - rad*1.15);
          ctx.moveTo(x + rad*0.2, y - rad*0.75);
          ctx.lineTo(x + rad*0.35, y - rad*1.15);
          ctx.stroke();
          ctx.fillStyle = '#ffee88';
          ctx.beginPath();
          ctx.arc(x - rad*0.15, y - rad*0.55, rad*0.08, 0, Math.PI*2);
          ctx.arc(x + rad*0.15, y - rad*0.55, rad*0.08, 0, Math.PI*2);
          ctx.fill();
        } else {
          switch(skin.forma) {
            case 'circle': ctx.arc(x, y, rad, 0, Math.PI*2); break;
            case 'square': ctx.rect(x-rad, y-rad, rad*2, rad*2); break;
            case 'diamond':
              ctx.moveTo(x, y-rad); ctx.lineTo(x+rad, y); ctx.lineTo(x, y+rad); ctx.lineTo(x-rad, y); ctx.closePath(); break;
            case 'hexagon':
              for(var k=0;k<6;k++) {
                var angle = Math.PI/6 + k*Math.PI/3;
                var hx = x + rad*Math.cos(angle), hy = y + rad*Math.sin(angle);
                if(k===0) ctx.moveTo(hx,hy); else ctx.lineTo(hx,hy);
              }
              ctx.closePath(); break;
            case 'star':
              for(var k=0;k<10;k++) {
                var angle = -Math.PI/2 + k*Math.PI/5;
                var radius = k%2===0 ? rad : rad*0.5;
                var sx = x + radius*Math.cos(angle), sy = y + radius*Math.sin(angle);
                if(k===0) ctx.moveTo(sx,sy); else ctx.lineTo(sx,sy);
              }
              ctx.closePath(); break;
            default: ctx.arc(x, y, rad, 0, Math.PI*2);
          }
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.stroke();
        }
        ctx.fillStyle = '#fff';
        ctx.font = 'bold ' + Math.round(rad*0.7) + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (rotateText) { ctx.save(); ctx.translate(x,y); ctx.rotate(Math.PI); ctx.fillText(String(p+1), 0, 0); ctx.restore(); }
        else ctx.fillText(String(p+1), x, y + (skin.forma === 'dragon' ? rad*0.25 : 0));
        ctx.shadowBlur = 0;
        return;
      }

      var wc = C[p];
      if (active) { ctx.shadowColor = wc.glow; ctx.shadowBlur = 20; }
      var g = ctx.createRadialGradient(x - rad*0.3, y - rad*0.35, rad*0.05, x, y, rad);
      g.addColorStop(0, wc.light); g.addColorStop(0.5, wc.main); g.addColorStop(1, wc.dark);
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI*2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = active ? 2 : 1;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold ' + Math.round(rad*0.9) + 'px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (rotateText) { ctx.save(); ctx.translate(x,y); ctx.rotate(Math.PI); ctx.fillText(String(p+1), 0, 0); ctx.restore(); }
      else ctx.fillText(String(p+1), x, y);
    }

    function resize() {
      var container = document.getElementById('canvas-container');
      if (!container) return;
      var maxW = Math.min(window.innerWidth - 20, 600);
      var PADDING = 10;
      var availW = maxW - PADDING * 2;
      if (availW < 10) return;
      GAP = Math.max(Math.round(availW / 9 * 0.10), 2);
      SZ = Math.round((availW - GAP * 8) / 9);
      if (SZ < 1) SZ = 1;
      PAT = SZ + GAP;
      BOARD = PAT * 9 - GAP;
      if (BOARD < 10) BOARD = 10;
      canvas.width = BOARD * SCALE;
      canvas.height = BOARD * SCALE;
      canvas.style.width = BOARD + 'px';
      canvas.style.height = BOARD + 'px';
      container.style.width = availW + 'px';
      container.style.padding = PADDING + 'px';
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    }

    function isBlocked(r,c,dr,dc,pH,pV) {
      if (dr === -1) return pH.some(function(w){ return w[0] === r-1 && (w[1] === c || w[1] === c-1); });
      if (dr === 1) return pH.some(function(w){ return w[0] === r && (w[1] === c || w[1] === c-1); });
      if (dc === -1) return pV.some(function(w){ return w[1] === c-1 && (w[0] === r || w[0] === r-1); });
      if (dc === 1) return pV.some(function(w){ return w[1] === c && (w[0] === r || w[0] === r-1); });
      return false;
    }
    function hasPath(player,pH,pV,positions) {
      var pos = positions || G.pos;
      var sr = pos[player][0], sc = pos[player][1];
      var goal = WIN[player];
      var vis = {}; vis[sr*9+sc] = true;
      var q = [[sr,sc]];
      while(q.length) {
        var cur = q.shift();
        var r = cur[0], c = cur[1];
        if (r === goal) return true;
        var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (var i = 0; i < 4; i++) {
          var nr = r + dirs[i][0], nc = c + dirs[i][1];
          if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
          if (isBlocked(r,c,dirs[i][0],dirs[i][1],pH,pV)) continue;
          var k = nr*9+nc;
          if (!vis[k]) { vis[k] = true; q.push([nr,nc]); }
        }
      }
      return false;
    }
    function bfsDist(player,pH,pV,positions) {
      var pos = positions || G.pos;
      var sr = pos[player][0], sc = pos[player][1];
      var goal = WIN[player];
      var dist = new Array(N*N).fill(999);
      dist[sr*9+sc] = 0;
      var q = [[sr,sc,0]];
      while(q.length) {
        var cur = q.shift();
        var r = cur[0], c = cur[1], d = cur[2];
        if (r === goal) return d;
        var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (var i = 0; i < 4; i++) {
          var nr = r + dirs[i][0], nc = c + dirs[i][1];
          if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
          if (isBlocked(r,c,dirs[i][0],dirs[i][1],pH,pV)) continue;
          var k = nr*9+nc;
          if (dist[k] > d + 1) { dist[k] = d + 1; q.push([nr,nc,d+1]); }
        }
      }
      return 999;
    }
    function legalMoves(p,pH,pV,positions) {
      pH = pH || G.pH; pV = pV || G.pV; positions = positions || G.pos;
      var r = positions[p][0], c = positions[p][1];
      var or = positions[1-p][0], oc = positions[1-p][1];
      var res = [];
      var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
      for (var i = 0; i < 4; i++) {
        var dr = dirs[i][0], dc = dirs[i][1];
        var nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
        if (isBlocked(r,c,dr,dc,pH,pV)) continue;
        if (!(nr === or && nc === oc)) { res.push([nr,nc]); continue; }
        var jr = nr + dr, jc = nc + dc;
        if (jr >= 0 && jr < N && jc >= 0 && jc < N && !isBlocked(nr,nc,dr,dc,pH,pV)) { res.push([jr,jc]); continue; }
        var sides = dr !== 0 ? [[0,1],[0,-1]] : [[1,0],[-1,0]];
        for (var j = 0; j < 2; j++) {
          var sr2 = nr + sides[j][0], sc3 = nc + sides[j][1];
          if (sr2 < 0 || sr2 >= N || sc3 < 0 || sc3 >= N) continue;
          if (!isBlocked(nr,nc,sides[j][0],sides[j][1],pH,pV)) res.push([sr2,sc3]);
        }
      }
      return res;
    }
    function canPlace(r,c,ori,pH,pV,positions) {
      pH = pH || G.pH; pV = pV || G.pV; positions = positions || G.pos;
      if (G.over || G.walls[G.turn] <= 0) return false;
      if (ori === 'H') {
        if (r < 0 || r >= N-1 || c < 0 || c >= N-1) return false;
        if (pH.some(function(w){ return w[0] === r && w[1] === c; })) return false;
        if (pH.some(function(w){ return w[0] === r && (w[1] === c-1 || w[1] === c+1); })) return false;
        if (pV.some(function(w){ return w[1] === c && w[0] === r; })) return false;
      } else {
        if (c < 0 || c >= N-1 || r < 0 || r >= N) return false;
        if (pV.some(function(w){ return w[0] === r && w[1] === c; })) return false;
        if (pV.some(function(w){ return w[1] === c && (w[0] === r-1 || w[0] === r+1); })) return false;
        if (pH.some(function(w){ return w[0] === r && w[1] === c; })) return false;
      }
      var tH = ori === 'H' ? pH.concat([[r,c]]) : pH.slice();
      var tV = ori === 'V' ? pV.concat([[r,c]]) : pV.slice();
      return hasPath(0,tH,tV,positions) && hasPath(1,tH,tV,positions);
    }
    function canPlaceIA(r,c,ori,pH,pV,walls,positions) {
      if (walls <= 0) return false;
      if (ori === 'H') {
        if (r < 0 || r >= N-1 || c < 0 || c >= N-1) return false;
        if (pH.some(function(w){ return w[0] === r && w[1] === c; })) return false;
        if (pH.some(function(w){ return w[0] === r && (w[1] === c-1 || w[1] === c+1); })) return false;
        if (pV.some(function(w){ return w[1] === c && w[0] === r; })) return false;
      } else {
        if (c < 0 || c >= N-1 || r < 0 || r >= N) return false;
        if (pV.some(function(w){ return w[0] === r && w[1] === c; })) return false;
        if (pV.some(function(w){ return w[1] === c && (w[0] === r-1 || w[0] === r+1); })) return false;
        if (pH.some(function(w){ return w[0] === r && w[1] === c; })) return false;
      }
      var tH = ori === 'H' ? pH.concat([[r,c]]) : pH.slice();
      var tV = ori === 'V' ? pV.concat([[r,c]]) : pV.slice();
      return hasPath(0,tH,tV,positions) && hasPath(1,tH,tV,positions);
    }
    function computeValid() {
      G.validH = []; G.validV = [];
      if (G.mode === 'H') for (var i=1; i<N; i++) for (var j=1; j<N; j++) if (canPlace(i-1,j-1,'H')) G.validH.push([i,j]);
      if (G.mode === 'V') for (var i=1; i<N; i++) for (var j=1; j<N; j++) if (canPlace(i-1,j-1,'V')) G.validV.push([i,j]);
    }
    function nodeXY(ni,nj) { return [nj*PAT - GAP/2, ni*PAT - GAP/2]; }

    // ===== IA completa (minimax com transposição) =====
    var transpositionTable = new Map();
    function hashState(pos, pH, pV) {
      var key = pos[0][0]+','+pos[0][1]+','+pos[1][0]+','+pos[1][1];
      key += '|'+pH.length+':'+pH.map(function(w){return w[0]+','+w[1];}).join(';');
      key += '|'+pV.length+':'+pV.map(function(w){return w[0]+','+w[1];}).join(';');
      return key;
    }
    function isRecentState(key) {
      for (var i = Math.max(0, positionHistory.length - 8); i < positionHistory.length; i++) {
        if (positionHistory[i] === key) return true;
      }
      return false;
    }
    function canWinNext(player, pH, pV, positions) {
      var moves = legalMoves(player, pH, pV, positions);
      for (var i = 0; i < moves.length; i++) {
        if (moves[i][0] === WIN[player]) return true;
      }
      return false;
    }
    function evaluateExpert(pos, pH, pV, walls) {
      var d0 = bfsDist(0, pH, pV, pos);
      var d1 = bfsDist(1, pH, pV, pos);
      if (d1 === 0) return 100000;
      if (d0 === 0) return -100000;
      var mob0 = legalMoves(0, pH, pV, pos).length;
      var mob1 = legalMoves(1, pH, pV, pos).length;
      var threat0 = canWinNext(0, pH, pV, pos) ? 5000 : 0;
      var threat1 = canWinNext(1, pH, pV, pos) ? 5000 : 0;
      var playerCol = pos[0][1];
      var playerRow = pos[0][0];
      var centerPenalty = 0;
      if (playerRow >= 2 && playerRow <= 6 && playerCol >= 2 && playerCol <= 6) {
        centerPenalty = 1000;
      }
      var centerDist = Math.abs(playerCol - 4) + Math.abs(playerRow - 4);
      centerPenalty += Math.max(0, 8 - centerDist) * 80;
      var blockadeBonus = mob1 <= 1 ? 800 : mob1 <= 2 ? 500 : mob1 <= 3 ? 250 : 50;
      var wallAdvantage = (walls[1] - walls[0]) * 45;
      var progressPenalty = pos[0][0] * 25;
      var progressBonus = (8 - pos[1][0]) * 20;
      var wallHoardingBonus = walls[1] * 30;
      return (d0 - d1) * 100 + (mob0 - mob1) * 20 + wallAdvantage + threat1 - threat0 + blockadeBonus - progressPenalty + progressBonus - centerPenalty + wallHoardingBonus;
    }
    function wallCandidatesExpert(pH, pV, walls, pos, iaIdx) {
      if (walls[iaIdx] <= 0) return [];
      var cands = [];
      var opp = 1 - iaIdx;
      var or = pos[opp][0], oc = pos[opp][1];
      var playerCenter = (or >= 2 && or <= 6 && oc >= 2 && oc <= 6);
      var minGain = playerCenter ? 1 : 1;
      for (var r = 0; r < N - 1; r++) {
        for (var c = 0; c < N - 1; c++) {
          if (canPlaceIA(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
            var tH = pH.concat([[r, c]]);
            var newDist = bfsDist(opp, tH, pV, pos);
            var gain = newDist - bfsDist(opp, pH, pV, pos);
            if (gain >= minGain) cands.push({r: r, c: c, ori: 'H', gain: gain});
          }
          if (canPlaceIA(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
            var tV = pV.concat([[r, c]]);
            var newDist = bfsDist(opp, pH, tV, pos);
            var gain = newDist - bfsDist(opp, pH, pV, pos);
            if (gain >= minGain) cands.push({r: r, c: c, ori: 'V', gain: gain});
          }
        }
      }
      cands.sort(function(a, b) { return b.gain - a.gain; });
      return cands;
    }
    function minimaxExpert(pos, pH, pV, walls, depth, alpha, beta, maximizing, iaIdx, startTime, timeLimit) {
      var key = hashState(pos, pH, pV);
      if (transpositionTable.has(key)) {
        var stored = transpositionTable.get(key);
        if (stored.depth >= depth) return stored.value;
      }
      var d0 = bfsDist(0, pH, pV, pos), d1 = bfsDist(1, pH, pV, pos);
      if (d1 === 0) return 100000 + depth;
      if (d0 === 0) return -100000 - depth;
      if (depth === 0 || Date.now() - startTime > timeLimit) return evaluateExpert(pos, pH, pV, walls);
      var cur = maximizing ? iaIdx : 1 - iaIdx;
      var moves = legalMoves(cur, pH, pV, pos);
      var wCands = wallCandidatesExpert(pH, pV, walls, pos, cur).slice(0, maximizing ? 80 : 50);
      var actions = [];
      for (var i = 0; i < moves.length; i++) {
        actions.push({type:'move', r:moves[i][0], c:moves[i][1], dist: Math.abs(moves[i][0] - WIN[cur])});
      }
      actions.sort(function(a,b){ return a.dist - b.dist; });
      for (var j = 0; j < wCands.length; j++) {
        actions.push({type:'wall', r:wCands[j].r, c:wCands[j].c, ori:wCands[j].ori});
      }
      if (!actions.length) return evaluateExpert(pos, pH, pV, walls);
      var bestVal = maximizing ? -Infinity : Infinity;
      for (var k = 0; k < actions.length; k++) {
        var act = actions[k];
        var npos = pos.map(function(p){ return p.slice(); });
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (act.type === 'move') npos[cur] = [act.r, act.c];
        else { if (act.ori === 'H') npH = pH.concat([[act.r, act.c]]); else npV = pV.concat([[act.r, act.c]]); nw[cur]--; }
        var newKey = hashState(npos, npH, npV);
        if (isRecentState(newKey)) continue;
        var val = minimaxExpert(npos, npH, npV, nw, depth - 1, alpha, beta, !maximizing, iaIdx, startTime, timeLimit);
        if (maximizing) { if (val > bestVal) bestVal = val; alpha = Math.max(alpha, bestVal); }
        else { if (val < bestVal) bestVal = val; beta = Math.min(beta, bestVal); }
        if (beta <= alpha) break;
      }
      transpositionTable.set(key, {value: bestVal, depth: depth});
      return bestVal;
    }
    function iaJogarExpert() {
      var cfg = {depth: 18, mistakes: 0, wallLimit: 800, timeLimit: 1000};
      var iaIdx = 1;
      var pos = G.pos.map(function(p){ return p.slice(); });
      var pH = G.pH.slice(), pV = G.pV.slice(), walls = G.walls.slice();
      var startTime = Date.now();
      transpositionTable.clear();
      var playerRow = pos[0][0], playerCol = pos[0][1];
      var playerCenter = (playerRow >= 2 && playerRow <= 6 && playerCol >= 2 && playerCol <= 6);
      var wallsUsed = WALLS - walls[iaIdx];
      var maxWallsToUse = playerCenter ? 10 : 4;
      var bestAction = null, bestScore = -Infinity;
      for (var depth = 2; depth <= cfg.depth; depth += 2) {
        if (Date.now() - startTime > cfg.timeLimit) break;
        var moves = legalMoves(iaIdx, pH, pV, pos);
        var wCands = wallCandidatesExpert(pH, pV, walls, pos, iaIdx).slice(0, cfg.wallLimit);
        if (!playerCenter && wallsUsed >= maxWallsToUse) wCands = [];
        var actions = [];
        if (canWinNext(0, pH, pV, pos)) {
          for (var i = 0; i < wCands.length; i++) {
            var w = wCands[i];
            var npH = w.ori === 'H' ? pH.concat([[w.r, w.c]]) : pH.slice();
            var npV = w.ori === 'V' ? pV.concat([[w.r, w.c]]) : pV.slice();
            if (!canWinNext(0, npH, npV, pos)) { bestAction = {type:'wall', r:w.r, c:w.c, ori:w.ori}; break; }
          }
          if (bestAction) break;
        }
        for (var i = 0; i < moves.length; i++) actions.push({type:'move', r:moves[i][0], c:moves[i][1]});
        for (var j = 0; j < wCands.length; j++) actions.push({type:'wall', r:wCands[j].r, c:wCands[j].c, ori:wCands[j].ori});
        actions.sort(function(a,b){
          if (a.type === 'wall' && b.type === 'move') return -1;
          if (a.type === 'move' && b.type === 'wall') return 1;
          return 0;
        });
        for (var k = 0; k < actions.length; k++) {
          if (Date.now() - startTime > cfg.timeLimit) break;
          var act = actions[k];
          var npos = pos.map(function(p){ return p.slice(); });
          var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
          if (act.type === 'move') npos[iaIdx] = [act.r, act.c];
          else { if (act.ori === 'H') npH = pH.concat([[act.r, act.c]]); else npV = pV.concat([[act.r, act.c]]); nw[iaIdx]--; }
          var newKey = hashState(npos, npH, npV);
          if (isRecentState(newKey)) continue;
          var score = minimaxExpert(npos, npH, npV, nw, depth - 1, -Infinity, Infinity, false, iaIdx, startTime, cfg.timeLimit);
          if (score > bestScore) { bestScore = score; bestAction = act; }
        }
        if (bestScore > 90000) break;
      }
      if (!bestAction) {
        var moves = legalMoves(iaIdx, pH, pV, pos);
        if (moves.length) {
          moves.sort(function(a,b){ return Math.abs(a[0]-WIN[iaIdx]) - Math.abs(b[0]-WIN[iaIdx]); });
          var topMoves = moves.slice(0, Math.min(2, moves.length));
          bestAction = {type:'move', r:topMoves[Math.floor(Math.random()*topMoves.length)][0], c:topMoves[Math.floor(Math.random()*topMoves.length)][1]};
        }
      }
      if (bestAction) {
        var finalPos = pos.map(function(p){ return p.slice(); });
        var finalPH = pH.slice(), finalPV = pV.slice();
        if (bestAction.type === 'move') finalPos[iaIdx] = [bestAction.r, bestAction.c];
        else if (bestAction.ori === 'H') finalPH = pH.concat([[bestAction.r, bestAction.c]]);
        else finalPV = pV.concat([[bestAction.r, bestAction.c]]);
        positionHistory.push(hashState(finalPos, finalPH, finalPV));
        if (positionHistory.length > 8) positionHistory.shift();
      }
      return bestAction;
    }
    function nivelConfig() {
      switch (G.nivelIA) {
        case 'facil': return {depth:1, wallChance:0.15, mistakes:0.45, wallLimit:6, timeLimit:200};
        case 'medio': return {depth:3, wallChance:0.35, mistakes:0.15, wallLimit:12, timeLimit:500};
        case 'dificil': return {depth:4, wallChance:0.55, mistakes:0.05, wallLimit:18, timeLimit:800};
        case 'expert': return {depth:18, wallChance:1.0, mistakes:0.0, wallLimit:800, timeLimit:1000};
        default: return {depth:2, wallChance:0.35, mistakes:0.15, wallLimit:12, timeLimit:400};
      }
    }
    function iaJogar() {
      if (G.nivelIA === 'expert') return iaJogarExpert();
      var cfg = nivelConfig();
      var iaIdx = 1;
      var pos = G.pos.map(function(p){ return p.slice(); });
      var pH = G.pH.slice(), pV = G.pV.slice(), walls = G.walls.slice();
      var startTime = Date.now();
      transpositionTable.clear();
      if (Math.random() < cfg.mistakes) {
        var moves = legalMoves(iaIdx, pH, pV, pos);
        if (moves.length) {
          var m = moves[Math.floor(Math.random() * moves.length)];
          return {type:'move', r:m[0], c:m[1]};
        }
      }
      var bestAction = null, bestScore = -Infinity;
      for (var depth = 2; depth <= cfg.depth; depth += 2) {
        if (Date.now() - startTime > cfg.timeLimit) break;
        var moves = legalMoves(iaIdx, pH, pV, pos);
        var wCands = wallCandidates(pH, pV, walls, pos, iaIdx).slice(0, cfg.wallLimit);
        var actions = [];
        if (canWinNext(0, pH, pV, pos)) {
          for (var i = 0; i < wCands.length; i++) {
            var w = wCands[i];
            var npH = w.ori === 'H' ? pH.concat([[w.r, w.c]]) : pH.slice();
            var npV = w.ori === 'V' ? pV.concat([[w.r, w.c]]) : pV.slice();
            if (!canWinNext(0, npH, npV, pos)) { bestAction = {type:'wall', r:w.r, c:w.c, ori:w.ori}; break; }
          }
          if (bestAction) break;
        }
        for (var i = 0; i < moves.length; i++) actions.push({type:'move', r:moves[i][0], c:moves[i][1]});
        for (var j = 0; j < wCands.length; j++) actions.push({type:'wall', r:wCands[j].r, c:wCands[j].c, ori:wCands[j].ori});
        for (var k = 0; k < actions.length; k++) {
          if (Date.now() - startTime > cfg.timeLimit) break;
          var act = actions[k];
          var npos = pos.map(function(p){ return p.slice(); });
          var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
          if (act.type === 'move') npos[iaIdx] = [act.r, act.c];
          else { if (act.ori === 'H') npH = pH.concat([[act.r, act.c]]); else npV = pV.concat([[act.r, act.c]]); nw[iaIdx]--; }
          var newKey = hashState(npos, npH, npV);
          if (isRecentState(newKey)) continue;
          var score = minimax(npos, npH, npV, nw, depth - 1, -Infinity, Infinity, false, iaIdx, startTime, cfg.timeLimit);
          if (score > bestScore) { bestScore = score; bestAction = act; }
        }
        if (bestScore > 90000) break;
      }
      if (!bestAction) {
        var moves = legalMoves(iaIdx, pH, pV, pos);
        if (moves.length) {
          moves.sort(function(a,b){ return Math.abs(a[0]-WIN[iaIdx]) - Math.abs(b[0]-WIN[iaIdx]); });
          bestAction = {type:'move', r:moves[0][0], c:moves[0][1]};
        }
      }
      if (bestAction) {
        var finalPos = pos.map(function(p){ return p.slice(); });
        var finalPH = pH.slice(), finalPV = pV.slice();
        if (bestAction.type === 'move') finalPos[iaIdx] = [bestAction.r, bestAction.c];
        else if (bestAction.ori === 'H') finalPH = pH.concat([[bestAction.r, bestAction.c]]);
        else finalPV = pV.concat([[bestAction.r, bestAction.c]]);
        positionHistory.push(hashState(finalPos, finalPH, finalPV));
        if (positionHistory.length > 8) positionHistory.shift();
      }
      return bestAction;
    }

    // ===== Desenho do tabuleiro =====
    function draw() {
      if (!BOARD || BOARD < 10) return;
      ctx.clearRect(0,0,BOARD,BOARD);
      ctx.fillStyle='#1a1410'; rr(0,0,BOARD,BOARD,14); ctx.fill();
      for (var r=0; r<N; r++) for (var c=0; c<N; c++) {
        var x = c*PAT, y = r*PAT;
        ctx.fillStyle = r===WIN[0] ? 'rgba(212,163,115,0.15)' : r===WIN[1] ? 'rgba(77,171,247,0.15)' : 'rgba(255,255,255,0.03)';
        rr(x+2, y+2, SZ-4, SZ-4, 6); ctx.fill();
      }
      var playerColor = C[G.turn].main;
      for (var i=0; i<G.moves.length; i++) {
        var mr = G.moves[i][0], mc = G.moves[i][1];
        var x = mc*PAT, y = mr*PAT;
        ctx.fillStyle = playerColor+'22'; rr(x,y,SZ,SZ,6); ctx.fill();
        ctx.strokeStyle = playerColor+'77'; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
        rr(x,y,SZ,SZ,6); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = playerColor; ctx.beginPath(); ctx.arc(x+SZ/2, y+SZ/2, SZ*0.1, 0, Math.PI*2); ctx.fill();
      }
      if (G.sel) { var r = G.sel[0], c = G.sel[1]; ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=2; rr(c*PAT, r*PAT, SZ, SZ, 6); ctx.stroke(); }
      var pc = C[G.turn];
      if (G.mode === 'H') for (var i=0; i<G.validH.length; i++) {
        var ni = G.validH[i][0], nj = G.validH[i][1];
        var xy = nodeXY(ni,nj); var x = xy[0], y = xy[1];
        var isHov = G.hoverNode && G.hoverNode.i === ni && G.hoverNode.j === nj;
        if (isHov) { ctx.shadowColor = pc.main; ctx.shadowBlur = 20; }
        ctx.fillStyle = isHov ? pc.dotHov : pc.dot; ctx.beginPath(); ctx.arc(x, y, isHov ? 8 : 6, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
        if (isHov) { var wallW = SZ*2 + GAP; rr(x - wallW/2, y - GAP/2, wallW, GAP, GAP/2); ctx.fillStyle = pc.main + '55'; ctx.fill(); }
      }
      if (G.mode === 'V') for (var i=0; i<G.validV.length; i++) {
        var ni = G.validV[i][0], nj = G.validV[i][1];
        var xy = nodeXY(ni,nj); var x = xy[0], y = xy[1];
        var isHov = G.hoverNode && G.hoverNode.i === ni && G.hoverNode.j === nj;
        if (isHov) { ctx.shadowColor = pc.main; ctx.shadowBlur = 20; }
        ctx.fillStyle = isHov ? pc.dotHov : pc.dot; ctx.beginPath(); ctx.arc(x, y, isHov ? 8 : 6, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
        if (isHov) { var wallH = SZ*2 + GAP; rr(x - GAP/2, y - wallH/2, GAP, wallH, GAP/2); ctx.fillStyle = pc.main + '55'; ctx.fill(); }
      }
      ctx.save(); ctx.beginPath(); ctx.rect(0,0,BOARD,BOARD); ctx.clip();
      for (var i=0; i<G.pH.length; i++) {
        var r = G.pH[i][0], c = G.pH[i][1]; var wc = C[G.wallOwnerH[i]]; var xy = nodeXY(r+1, c+1);
        var wallW = SZ*2 + GAP, wallH = Math.max(GAP, 5);
        ctx.shadowColor = wc.wallShadow; ctx.shadowBlur = 12; ctx.fillStyle = wc.wallFill;
        rr(xy[0] - wallW/2, xy[1] - wallH/2, wallW, wallH, wallH/2); ctx.fill(); ctx.shadowBlur = 0;
      }
      for (var i=0; i<G.pV.length; i++) {
        var r = G.pV[i][0], c = G.pV[i][1]; var wc = C[G.wallOwnerV[i]]; var xy = nodeXY(r+1, c+1);
        var wallW = Math.max(GAP, 5), wallH = SZ*2 + GAP;
        ctx.shadowColor = wc.wallShadow; ctx.shadowBlur = 12; ctx.fillStyle = wc.wallFill;
        rr(xy[0] - wallW/2, xy[1] - wallH/2, wallW, wallH, wallW/2); ctx.fill(); ctx.shadowBlur = 0;
      }
      ctx.restore();
      for (var p=0; p<2; p++) {
        var r = G.pos[p][0], c = G.pos[p][1]; var x = c*PAT + SZ/2, y = r*PAT + SZ/2, rad = SZ*0.32;
        var active = G.turn === p && !G.over;
        var rotateText = (p === 1 && !G.vsIA);
        drawPawn(p, x, y, rad, active, rotateText);
      }
    }
    function rr(x,y,w,h,r2) {
      r2 = Math.min(r2, w/2, h/2, 20);
      ctx.beginPath(); ctx.moveTo(x+r2,y); ctx.lineTo(x+w-r2,y); ctx.arcTo(x+w,y,x+w,y+r2,r2);
      ctx.lineTo(x+w,y+h-r2); ctx.arcTo(x+w,y+h,x+w-r2,y+h,r2); ctx.lineTo(x+r2,y+h);
      ctx.arcTo(x,y+h,x,y+h-r2,r2); ctx.lineTo(x,y+r2); ctx.arcTo(x,y,x+r2,y,r2); ctx.closePath();
    }

    function initPips() {
      for (var p=0; p<2; p++) {
        var el = document.getElementById('pips' + (p+1));
        el.innerHTML = '';
        for (var i=0; i<WALLS; i++) { var d = document.createElement('div'); d.className = 'pip'; el.appendChild(d); }
      }
    }
    function updateWallIndicators() {
      for (var p=0; p<2; p++) {
        var children = document.getElementById('pips' + (p+1)).children;
        for (var i=0; i<WALLS; i++) {
          if (i >= G.walls[p]) children[i].classList.add('usado');
          else children[i].classList.remove('usado');
        }
      }
      updateTimerDisplay(); syncBtn();
    }
    function st(t) { statusEl.textContent = t; }
    function updateTimerDisplay() {
      if (G.over) {
        timerDisplayEl.className = 'fim';
        timerDisplayEl.innerHTML = '<span>FIM!</span><span class="tempo">◈</span>';
        stopTimer(); return;
      }
      var playerName = (G.turn === 0 ? G.p1Name : G.p2Name).toUpperCase();
      timerDisplayEl.className = G.turn === 0 ? 'vez1' : 'vez2';
      timerDisplayEl.innerHTML = '<span>' + playerName + '</span><span class="tempo" id="timerDisplay">' + currentTime + '</span>';
      stopTimer();
      if (!G.over && gameActive && !matchFinished) startTimer();
    }
    function syncBtn() {
      var pc = C[G.turn];
      ['btnH','btnV','btnH2','btnV2'].forEach(function(id) {
        var b = document.getElementById(id);
        var match = false;
        if (id === 'btnH') match = G.mode === 'H' && G.turn === 0;
        else if (id === 'btnV') match = G.mode === 'V' && G.turn === 0;
        else if (id === 'btnH2') match = G.mode === 'H' && G.turn === 1 && !G.vsIA;
        else if (id === 'btnV2') match = G.mode === 'V' && G.turn === 1 && !G.vsIA;
        b.style.borderColor = match ? pc.main : 'rgba(255,215,140,0.12)';
        b.style.color = match ? pc.main : '#b8a99a';
        b.style.background = match ? pc.main + '15' : 'rgba(30,22,16,0.8)';
        b.classList.toggle('modo-ativo', match);
      });
    }
    function setIAThinking(v) { G.iaThinking = v; iaTh.className = v ? 'show' : ''; if (!v) updateTimerDisplay(); }
    function startTimer() {
      stopTimer(); if (G.over || !gameActive || matchFinished) return;
      currentTime = config.time;
      var el = document.getElementById('timerDisplay'); if (el) el.textContent = currentTime;
      timerRunning = true;
      timerInterval = setInterval(function() {
        currentTime--;
        var el = document.getElementById('timerDisplay'); if (el) el.textContent = currentTime;
        if (currentTime <= 0) {
          clearInterval(timerInterval); timerRunning = false;
          var vencedor = 1 - G.turn;
          scores[vencedor]++; atualizarPlacar();
          G.over = true; G.mode = 'move'; syncBtn(); setIAThinking(false);
          var nomeVencedor = vencedor === 0 ? G.p1Name : G.p2Name;
          showWinOverlay('⏰ Tempo esgotado!<span class="sub">' + nomeVencedor + ' vence a rodada!</span>', vencedor);
        }
      }, 1000);
    }
    function stopTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } timerRunning = false; }
    function atualizarPlacar() {
      document.getElementById('score1').textContent = scores[0];
      document.getElementById('score2').textContent = scores[1];
      document.getElementById('rodada-info').textContent = 'Rodada ' + currentRound + ' de ' + config.rounds;
    }

    function showWinOverlay(msg, vencedor) {
      stopTimer();
      var msgEl = document.getElementById('win-message');
      msgEl.innerHTML = msg;
      msgEl.classList.remove('win-p1','win-p2');
      if (vencedor === 0) msgEl.classList.add('win-p1');
      else if (vencedor === 1) msgEl.classList.add('win-p2');
      document.getElementById('btn-close-win').style.display = 'none';
      var container = document.getElementById('confetti-container');
      container.innerHTML = '';
      var cores = ['#d4a373','#4dabf7','#10b981','#e94560','#f97316','#a855f7','#ec4899','#facc15','#22d3ee','#ff6b6b'];
      var cx = window.innerWidth/2, cy = window.innerHeight/2;
      for (var i=0; i<100; i++) {
        var p = document.createElement('div'); p.className = 'confetti-piece';
        var angle = Math.random() * 2 * Math.PI, dist = Math.random() * 550 + 180;
        p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * dist - 100 + 'px');
        p.style.left = cx + 'px'; p.style.top = cy + 'px';
        p.style.background = cores[Math.floor(Math.random() * cores.length)];
        p.style.width = (Math.random() * 10 + 4) + 'px';
        p.style.height = (Math.random() * 14 + 6) + 'px';
        p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        p.style.animationDuration = (Math.random() * 1.4 + 1.4) + 's';
        p.style.animationDelay = (Math.random() * 0.25) + 's';
        container.appendChild(p);
      }
      setTimeout(function() { container.innerHTML = ''; }, 4500);
      document.getElementById('win-overlay').classList.add('show');
      if (autoResetTimer) clearTimeout(autoResetTimer);
      autoResetTimer = setTimeout(function() {
        document.getElementById('win-overlay').classList.remove('show');
        var needed = Math.floor(config.rounds / 2) + 1;
        if (currentRound >= config.rounds || scores[0] >= needed || scores[1] >= needed) {
          matchFinished = true; gameActive = false;
          var winner = scores[0] > scores[1] ? 0 : scores[1] > scores[0] ? 1 : -1;
          if (winner !== -1) {
              var stats = getStats();

              // ============================================================
              // MODO ONLINE — progressão de perfil REAL
              // ============================================================
              if (typeof isOnlineMode !== 'undefined' && isOnlineMode) {
                var _euVenci = (winner === 0 && G.p1Name === currentUser) || (winner === 1 && G.p2Name === currentUser);
                var _meuElo = stats.rankPoints || 0;
                var _pontosBase = _euVenci ? 25 : -15;
                var _xpGanho = _euVenci ? 80 : 20;

                stats.games++;
                if (_euVenci) {
                  stats.wins++;
                  stats.streak = (stats.streak || 0) + 1;
                  stats.maxStreak = Math.max(stats.maxStreak || 0, stats.streak);
                } else {
                  stats.losses++;
                  stats.streak = 0;
                }
                stats.rankPoints = Math.max(0, _meuElo + _pontosBase);
                stats.rankPoints = Math.round(stats.rankPoints * 100) / 100;
                stats.maxRankPoints = Math.max(stats.maxRankPoints || 0, stats.rankPoints);
                stats.xp = (stats.xp || 0) + _xpGanho;
                while (stats.level < 100 && stats.xp >= xpParaProximoNivel(stats.level)) {
                  stats.xp -= xpParaProximoNivel(stats.level);
                  stats.level++;
                }
                stats.totalWalls += seriesStats.userWalls;
                stats.totalTurns += seriesStats.userMoves;

                if (!stats.history) stats.history = [];
                stats.history.unshift({
                  date: Date.now(),
                  mode: 'Online',
                  result: _euVenci ? 'Vitória' : 'Derrota',
                  points: _pontosBase,
                  walls: seriesStats.userWalls,
                  moves: seriesStats.userMoves,
                  rounds: config.rounds,
                  time: config.time,
                  xp: _xpGanho
                });
                if (stats.history.length > 100) stats.history.pop();
                saveStats(stats);
                if (currentUser && typeof updateRankDisplay === 'function') updateRankDisplay(currentUser);
              }

              // Detectar títulos locais ANTES de atualizar
              var titulosAntes = [];
              if (!G.vsIA && typeof LOCAL_GAMES_TITLES !== 'undefined') {
                for (var i = 0; i < LOCAL_GAMES_TITLES.length; i++) {
                  if ((stats.localGames || 0) >= LOCAL_GAMES_TITLES[i].minLocalGames) {
                    titulosAntes.push(LOCAL_GAMES_TITLES[i].title);
                  }
                }
              }
              if (G.vsIA && G.nivelIA === 'expert' && typeof IA_WINS_TITLES !== 'undefined') {
                for (var i = 0; i < IA_WINS_TITLES.length; i++) {
                  if ((stats.expertWins || 0) >= IA_WINS_TITLES[i].minVsIAWins) {
                    titulosAntes.push(IA_WINS_TITLES[i].title);
                  }
                }
              }

              // Modo local: sem progressão de perfil.
              // Só conta pra títulos específicos (vs IA Expert, 2 Jogadores).
              if (!G.vsIA) {
                stats.localGames = (stats.localGames || 0) + 1;
              }
              if (G.vsIA && G.nivelIA === 'expert' && winner === 0) {
                stats.expertWins = (stats.expertWins || 0) + 1;
              }
              saveStats(stats);

              // Detectar títulos locais DEPOIS de atualizar
              var titulosNovos = [];
              if (!G.vsIA && typeof LOCAL_GAMES_TITLES !== 'undefined') {
                for (var i = 0; i < LOCAL_GAMES_TITLES.length; i++) {
                  var t = LOCAL_GAMES_TITLES[i];
                  if ((stats.localGames || 0) >= t.minLocalGames && titulosAntes.indexOf(t.title) === -1) {
                    titulosNovos.push(t.title);
                  }
                }
              }
              if (G.vsIA && G.nivelIA === 'expert' && typeof IA_WINS_TITLES !== 'undefined') {
                for (var i = 0; i < IA_WINS_TITLES.length; i++) {
                  var t2 = IA_WINS_TITLES[i];
                  if ((stats.expertWins || 0) >= t2.minVsIAWins && titulosAntes.indexOf(t2.title) === -1) {
                    titulosNovos.push(t2.title);
                  }
                }
              }

              var vencedorFinal = scores[0] > scores[1] ? G.p1Name : scores[1] > scores[0] ? G.p2Name : 'Empate';

              // Sequência de cards independentes
              var cardsSeq = [];
              cardsSeq.push({
                tipo: 'fim',
                html: '◈ FIM DE JOGO!<span class="sub">' + vencedorFinal + ' venceu (' + scores[0] + ' x ' + scores[1] + ')</span>'
              });

              // MODO ONLINE: card com ganho de ELO/XP
              if (typeof isOnlineMode !== 'undefined' && isOnlineMode) {
                var _euVenciCard = (winner === 0 && G.p1Name === currentUser) || (winner === 1 && G.p2Name === currentUser);
                var _eloDelta = _euVenciCard ? '+25' : '-15';
                var _xpCard = _euVenciCard ? '+80' : '+20';
                var _corElo = _euVenciCard ? '#10b981' : '#e94560';
                cardsSeq.push({
                  tipo: 'online',
                  html: '<div style="padding:12px;margin-top:10px;border-radius:12px;background:rgba(212,163,115,0.1);border:2px solid rgba(212,163,115,0.3);text-align:center">' +
                        '<div style="font-size:11px;color:#b8a99a;margin-bottom:6px;letter-spacing:1px">PARTIDA RANQUEADA</div>' +
                        '<div style="font-size:16px;font-weight:900;color:' + _corElo + '">' + _eloDelta + ' ELO</div>' +
                        '<div style="font-size:14px;font-weight:700;color:#facc15;margin-top:4px">' + _xpCard + ' XP</div>' +
                        '</div>'
                });
              }
              for (var i = 0; i < titulosNovos.length; i++) {
                cardsSeq.push({
                  tipo: 'titulo',
                  html: '<div class="titulo-desbloqueado">✨ NOVO TÍTULO ✨<br><strong>' + titulosNovos[i] + '</strong></div>'
                });
              }

              var cardIdx = 0;
              var msgEl = document.getElementById('win-message');
              var oldBtn = document.getElementById('btn-close-win');
              var newBtn = oldBtn.cloneNode(true);
              oldBtn.parentNode.replaceChild(newBtn, oldBtn);

              function renderCard(idx) {
                msgEl.innerHTML = cardsSeq[idx].html;
                newBtn.textContent = (idx < cardsSeq.length - 1) ? 'PRÓXIMO ▶' : 'FECHAR';
              }

              newBtn.addEventListener('click', function () {
                if (cardIdx < cardsSeq.length - 1) {
                  cardIdx++;
                  renderCard(cardIdx);
                  return;
                }
                // Último card — fecha e volta pro lobby
                document.getElementById('win-overlay').classList.remove('show');
                newBtn.style.display = 'none';
                if (typeof goToLobby === 'function') goToLobby();
              });

              renderCard(0);
              newBtn.style.display = 'block';
              document.getElementById('win-overlay').classList.add('show');
              return;
          }
        }
        currentRound++; atualizarPlacar(); resetGame();
      }, 3500);
    }

    function selectPawn(r,c) {
      if (!gameActive || G.over || matchFinished) return;
      var pr = G.pos[G.turn][0], pc = G.pos[G.turn][1];
      if (pr !== r || pc !== c) { st('Toque no seu peão ' + (G.turn === 0 ? G.p1Name : G.p2Name)); return; }
      G.sel = [r,c]; G.moves = legalMoves(G.turn);
      st(G.moves.length ? G.moves.length + ' movimentos' : 'Sem movimentos');
      draw();
    }
    function doMove(r,c) {
      if (!gameActive || G.over || matchFinished) return;
      if (G.turn === 0) seriesStats.userMoves++;
      G.hist.push({type:'move', turn:G.turn, from:G.pos[G.turn].slice()});
      G.pos[G.turn] = [r,c]; G.sel = null; G.moves = [];
      checkWin();
      if (!G.over) {
        setMode('move'); nextTurn();
        if (G.vsIA && G.turn === 1 && !G.over) scheduleIA();
        else { selectPawn(G.pos[G.turn][0], G.pos[G.turn][1]); }
      }
      updateWallIndicators(); draw();
      if (isOnlineMode) enviarJogadaOnline({ type: "move", r: r, c: c });
    }
    function placeWall(ni,nj,ori) {
      if (!gameActive || G.over || matchFinished) return;
      var r = ni-1, c = nj-1;
      if (!canPlace(r,c,ori)) { st('Posição inválida!'); return; }
      if (G.turn === 0) seriesStats.userWalls++;
      G.hist.push({type:'wall', turn:G.turn, r:r, c:c, ori:ori, walls:G.walls.slice(), owH:G.wallOwnerH.slice(), owV:G.wallOwnerV.slice()});
      if (ori === 'H') { G.pH.push([r,c]); G.wallOwnerH.push(G.turn); }
      else { G.pV.push([r,c]); G.wallOwnerV.push(G.turn); }
      G.walls[G.turn]--; G.sel = null; G.moves = []; G.validH = []; G.validV = []; G.hoverNode = null;
      st('Parede! Restam ' + G.walls[G.turn]);
      checkWin();
      if (!G.over) {
        setMode('move'); nextTurn();
        if (G.vsIA && G.turn === 1 && !G.over) scheduleIA();
        else { selectPawn(G.pos[G.turn][0], G.pos[G.turn][1]); }
      }
      updateWallIndicators(); draw();
      if (isOnlineMode) enviarJogadaOnline({ type: "wall", r: r, c: c, ori: ori });
    }
    function checkWin() {
      if ((G.turn === 0 && G.pos[0][0] === WIN[0]) || (G.turn === 1 && G.pos[1][0] === WIN[1])) {
        G.over = true; G.mode = 'move'; syncBtn(); setIAThinking(false);
        scores[G.turn]++; atualizarPlacar();
        var nome = G.turn === 0 ? G.p1Name : G.p2Name;
        showWinOverlay('◈ ' + nome + ' vence a rodada!', G.turn);
      }
    }
    function nextTurn() {
      G.turn = 1 - G.turn;
      if (G.mode !== 'move') { computeValid(); st((G.mode === 'H' ? G.validH : G.validV).length + ' posições'); }
      else st(G.vsIA && G.turn === 1 ? 'IA pensando...' : ((G.turn === 0 ? G.p1Name : G.p2Name) + ': toque no peão'));
      if (!G.vsIA) {
        document.getElementById('game-screen').classList.toggle('p2-active', G.turn === 1);
        document.getElementById('hud-wrapper').classList.toggle('rotated', G.turn === 1);
      } else {
        document.getElementById('game-screen').classList.remove('p2-active');
        document.getElementById('hud-wrapper').classList.remove('rotated');
      }
    }
    function scheduleIA() {
      if (G.iaThinking || G.over || !gameActive || matchFinished) return;
      setIAThinking(true);
      var delay = 200 + (G.nivelIA === 'facil' ? 0 : G.nivelIA === 'medio' ? 150 : G.nivelIA === 'dificil' ? 300 : 150);
      setTimeout(function() {
        if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
        var act = iaJogar(); setIAThinking(false);
        if (!act) return;
        stopTimer();
        if (act.type === 'move') {
          G.hist.push({type:'move', turn:1, from:G.pos[1].slice()});
          G.pos[1] = [act.r, act.c]; G.sel = null; G.moves = [];
          checkWin(); if (!G.over) nextTurn();
        } else {
          G.hist.push({type:'wall', turn:1, r:act.r, c:act.c, ori:act.ori, walls:G.walls.slice(), owH:G.wallOwnerH.slice(), owV:G.wallOwnerV.slice()});
          if (act.ori === 'H') { G.pH.push([act.r, act.c]); G.wallOwnerH.push(1); }
          else { G.pV.push([act.r, act.c]); G.wallOwnerV.push(1); }
          G.walls[1]--; G.sel = null; G.moves = []; G.validH = []; G.validV = [];
          checkWin(); if (!G.over) nextTurn();
        }
        updateWallIndicators(); draw();
        if (!G.over && G.turn === 0) selectPawn(G.pos[0][0], G.pos[0][1]);
      }, delay);
    }
    function undo() {
      if (!gameActive || G.over || matchFinished || !G.hist.length || G.iaThinking) return;
      var steps = G.vsIA && G.hist.length >= 2 ? 2 : 1;
      for (var s=0; s<steps; s++) {
        if (!G.hist.length) break;
        var h = G.hist.pop();
        G.turn = h.turn;
        if (h.type === 'move') { G.pos[h.turn] = h.from.slice(); if (h.turn === 0) seriesStats.userMoves--; }
        else {
          G.walls = h.walls.slice(); G.wallOwnerH = h.owH.slice(); G.wallOwnerV = h.owV.slice();
          if (h.ori === 'H') G.pH = G.pH.filter(function(w){ return !(w[0] === h.r && w[1] === h.c); });
          else G.pV = G.pV.filter(function(w){ return !(w[0] === h.r && w[1] === h.c); });
          if (h.turn === 0) seriesStats.userWalls--;
        }
      }
      G.sel = null; G.moves = []; G.hoverNode = null;
      if (G.mode !== 'move') computeValid();
      st('Desfeito!'); setIAThinking(false); updateWallIndicators(); syncBtn(); draw();
    }
    function resetGame() {
      stopTimer(); if (autoResetTimer) clearTimeout(autoResetTimer); if (autoResetTimer2) clearTimeout(autoResetTimer2);
      document.getElementById('win-overlay').classList.remove('show');
      document.getElementById('confetti-container').innerHTML = '';
      document.getElementById('btn-close-win').style.display = 'none';
      G = {pos:[[8,4],[0,4]], walls:[WALLS,WALLS], turn:0, pH:[], pV:[], wallOwnerH:[], wallOwnerV:[], hist:[], over:false, sel:null, moves:[], mode:'move', validH:[], validV:[], hoverNode:null, vsIA:G.vsIA, nivelIA:G.nivelIA, iaThinking:false, p1Name:G.p1Name, p2Name:G.p2Name, online:false, salald:null};
      gameActive = true; matchFinished = false; currentTime = config.time;
      positionHistory = [];
      resize();
      updateWallIndicators(); syncBtn(); st(G.p1Name + ' começa'); draw();
      selectPawn(G.pos[0][0], G.pos[0][1]);
      if (!G.vsIA) {
        document.getElementById('game-screen').classList.remove('p2-active');
        document.getElementById('hud-wrapper').classList.remove('rotated');
      } else {
        document.getElementById('game-screen').classList.remove('p2-active');
        document.getElementById('hud-wrapper').classList.remove('rotated');
      }
    }
    function reset() {
      stopTimer(); if (autoResetTimer) clearTimeout(autoResetTimer); if (autoResetTimer2) clearTimeout(autoResetTimer2);
      document.getElementById('win-overlay').classList.remove('show');
      document.getElementById('confetti-container').innerHTML = '';
      document.getElementById('btn-close-win').style.display = 'none';
      G = {pos:[[8,4],[0,4]], walls:[WALLS,WALLS], turn:0, pH:[], pV:[], wallOwnerH:[], wallOwnerV:[], hist:[], over:false, sel:null, moves:[], mode:'move', validH:[], validV:[], hoverNode:null, vsIA:G.vsIA, nivelIA:G.nivelIA, iaThinking:false, p1Name:G.p1Name, p2Name:G.p2Name, online:false, salald:null};
      document.getElementById('p1-nome').textContent = G.p1Name;
      document.getElementById('nomeJ2').textContent = G.p2Name;
      document.getElementById('placar-p1').textContent = G.p1Name;
      document.getElementById('placar-p2').textContent = G.p2Name;
      gameActive = true; matchFinished = false; currentTime = config.time;
      positionHistory = [];
      resize();
      updateWallIndicators(); syncBtn(); st(G.p1Name + ' começa'); draw();
      selectPawn(G.pos[0][0], G.pos[0][1]);
      if (!G.vsIA) {
        document.getElementById('game-screen').classList.remove('p2-active');
        document.getElementById('hud-wrapper').classList.remove('rotated');
      } else {
        document.getElementById('game-screen').classList.remove('p2-active');
        document.getElementById('hud-wrapper').classList.remove('rotated');
      }
      updateUndoButtonVisibility();
    }
    function setMode(m) {
      if (!gameActive || G.over || matchFinished) return;
      if (G.vsIA && G.turn === 1) return;
      if (m !== 'move' && G.walls[G.turn] <= 0) { st('Sem paredes!'); return; }
      G.mode = m; G.sel = null; G.moves = []; G.hoverNode = null; syncBtn();
      if (m !== 'move') { computeValid(); st((m === 'H' ? G.validH : G.validV).length + ' posições'); }
      else { G.validH = []; G.validV = []; st((G.turn === 0 ? G.p1Name : G.p2Name) + ': toque no peão'); }
      draw();
    }
    function getEventXY(e) {
      var rect = canvas.getBoundingClientRect();
      var t = e.touches ? e.touches[0] : e;
      return [(t.clientX - rect.left) * (BOARD / rect.width), (t.clientY - rect.top) * (BOARD / rect.height)];
    }
    function nearestNode(px,py,list,th) {
      var best = null, bestD = th * th;
      for (var i=0; i<list.length; i++) {
        var xy = nodeXY(list[i][0], list[i][1]);
        var d = (px - xy[0]) * (px - xy[0]) + (py - xy[1]) * (py - xy[1]);
        if (d < bestD) { bestD = d; best = list[i]; }
      }
      return best;
    }
    function handleTap(e) {
      e.preventDefault();
      if (!gameActive || G.over || matchFinished || G.iaThinking || (G.vsIA && G.turn === 1)) return;
      var xy = getEventXY(e); var px = xy[0], py = xy[1];
      if (G.mode === 'H') { var n = nearestNode(px, py, G.validH, PAT*0.65); if (n) placeWall(n[0], n[1], 'H'); return; }
      if (G.mode === 'V') { var n = nearestNode(px, py, G.validV, PAT*0.65); if (n) placeWall(n[0], n[1], 'V'); return; }
      var col = Math.floor(px / PAT), row = Math.floor(py / PAT);
      if (row < 0 || row >= N || col < 0 || col >= N) return;
      if (G.sel && G.moves.some(function(m){ return m[0] === row && m[1] === col; })) doMove(row,col);
      else selectPawn(row,col);
    }
    function handleHover(e) {
      e.preventDefault();
      if (G.mode === 'move' || G.over || !gameActive || matchFinished) return;
      var xy = getEventXY(e);
      var list = G.mode === 'H' ? G.validH : G.validV;
      var node = nearestNode(xy[0], xy[1], list, PAT*0.65);
      var newHov = node ? {i:node[0], j:node[1]} : null;
      if (JSON.stringify(newHov) !== JSON.stringify(G.hoverNode)) { G.hoverNode = newHov; draw(); }
    }
    function showConfig() { document.getElementById('config-overlay').classList.add('show'); }
    function hideConfig() { document.getElementById('config-overlay').classList.remove('show'); }

    // ============================================================
    // LOGIN E NAVEGAÇÃO
    // ============================================================
    var loginForm = document.getElementById('login-form');
    var loginError = document.getElementById('login-error');
    var toggleLink = document.getElementById('toggle-login');
    var isLoginMode = true;

    function setLoginUI(entrar) {
      isLoginMode = !!entrar;
      var btn = document.getElementById('login-btn');
      var conf = document.getElementById('login-confirm');
      var modeEl = document.getElementById('login-mode-label');
      if (btn) btn.textContent = isLoginMode ? 'ENTRAR' : 'CRIAR CONTA';
      if (toggleLink) toggleLink.textContent = isLoginMode ? 'Nao tem conta? Cadastre-se' : 'Ja tem conta? Faca login';
      if (modeEl) {
        modeEl.textContent = isLoginMode ? 'Modo: ENTRAR na conta' : 'Modo: CRIAR conta nova';
        modeEl.style.color = isLoginMode ? '#10b981' : '#d4a373';
      }
      if (conf) {
        conf.style.display = isLoginMode ? 'none' : 'block';
        conf.required = !isLoginMode;
        if (isLoginMode) conf.value = '';
      }
      if (loginError) loginError.textContent = '';
    }
    setLoginUI(true);

    if (toggleLink) {
      toggleLink.addEventListener('click', function() {
        setLoginUI(!isLoginMode);
      });
    }
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        var username = document.getElementById('login-username').value.trim();
        var password = document.getElementById('login-password').value;
        var confirm = document.getElementById('login-confirm').value;
        if (!username || !password) { loginError.textContent = 'Preencha todos os campos'; return; }
        loginError.textContent = 'Aguarde...';
        try {
          // Cardinalidade: ENTRAR so loginUser; CRIAR so createUser
          if (isLoginMode) {
            // modo ENTRAR — nunca cria conta
            if (await loginUser(username, password)) {
              loginError.textContent = '';
              goToModeScreen(currentUser || username);
            } else {
              loginError.textContent = window.lastAuthError || 'Usuario ou senha invalidos';
            }
          } else {
            // modo CRIAR — exige confirm; nunca trata como login silencioso
            if (password.length < 6) { loginError.textContent = 'Senha minimo 6 caracteres'; return; }
            if (!confirm) { loginError.textContent = 'Confirme a senha'; return; }
            if (password !== confirm) { loginError.textContent = 'As senhas nao coincidem'; return; }
            if (await createUser(username, password)) {
              loginError.textContent = '';
              setLoginUI(true);
              goToModeScreen(currentUser || username);
            } else {
              loginError.textContent = window.lastAuthError || 'Nao foi possivel criar a conta';
            }
          }
        } catch (err) {
          loginError.textContent = 'Erro: ' + (err.message || err);
        }
      });
    }
    function goToModeScreen(username) {
      currentUser = username;
      var stats = getUserStats(username);
      document.getElementById('user-name').textContent = username;
      document.getElementById('user-avatar').textContent = username[0].toUpperCase();
      document.getElementById('stat-games-mode').textContent = stats.games;
      document.getElementById('stat-wins-mode').textContent = stats.wins;
      document.getElementById('stat-streak').textContent = stats.streak || 0;
      document.getElementById('user-level').textContent = 'Nível ' + (stats.level || 1);
      updateRankDisplay(username);
      showScreen('mode-screen');
    }
    function hideAllOverlays() {
      ['win-overlay','config-overlay','stats-overlay','profile-overlay','history-overlay','titles-overlay','inspect-overlay','skins-overlay','ranks-overlay','medals-overlay','sala-overlay'].forEach(function(id) { document.getElementById(id).classList.remove('show'); });
      document.getElementById('confetti-container').innerHTML = '';
    }
    function resetAllGameState() {
      stopTimer(); if (autoResetTimer) clearTimeout(autoResetTimer); if (autoResetTimer2) clearTimeout(autoResetTimer2);
      hideAllOverlays();
      G = {pos:[[8,4],[0,4]], walls:[10,10], turn:0, pH:[], pV:[], wallOwnerH:[], wallOwnerV:[], hist:[], over:false, sel:null, moves:[], mode:'move', validH:[], validV:[], hoverNode:null, nivelIA:G.nivelIA||'medio', iaThinking:false, p1Name:currentUser||'Player 1', p2Name:'Player 2', vsIA:G.vsIA, online:false, salald:null};
      gameActive = false; matchFinished = false; resetPending = false;
      scores = [0,0]; currentRound = 1; seriesStats = {userWalls:0, userMoves:0}; currentTime = config.time;
      positionHistory = [];
    }
    function goToLobby() {
      resetAllGameState();
      showScreen('mode-screen');
      var stats = getUserStats(currentUser);
      document.getElementById('stat-games-mode').textContent = stats.games;
      document.getElementById('stat-wins-mode').textContent = stats.wins;
      document.getElementById('stat-streak').textContent = stats.streak || 0;
      document.getElementById('user-level').textContent = 'Nível ' + (stats.level || 1);
      updateRankDisplay(currentUser);
    }

    document.getElementById('rank-indicator-btn').addEventListener('click', openRanks);
    document.getElementById('ranks-close').addEventListener('click', closeRanks);
    document.getElementById('btn-close-ranks').addEventListener('click', closeRanks);
    document.getElementById('ranks-overlay').addEventListener('click', function(e){ if (e.target === e.currentTarget) closeRanks(); });
    document.getElementById('rank-area').addEventListener('click', function(e){ if (e.target.id !== 'rank-indicator-btn') showHistory(); });
    document.getElementById('history-close').addEventListener('click', hideHistory);
    document.getElementById('history-overlay').addEventListener('click', function(e){ if (e.target === e.currentTarget) hideHistory(); });
    document.getElementById('user-info-profile').addEventListener('click', openProfile);
    document.getElementById('profile-close').addEventListener('click', closeProfile);
    document.getElementById('btn-close-profile').addEventListener('click', closeProfile);
    var btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', logoutUser);
    document.getElementById('profile-overlay').addEventListener('click', function(e){ if (e.target === e.currentTarget) closeProfile(); });
    document.getElementById('btn-vs-ia').addEventListener('click', function(){ prepararConfiguracao(true); });
    document.getElementById('btn-2p').addEventListener('click', function(){ prepararConfiguracao(false); });
    document.getElementById('btn-online').addEventListener('click', function() {
      if (!currentUser) { alert('Faça login primeiro.'); return; }
      document.getElementById('sala-overlay').classList.add('show');
      document.getElementById('sala-status').textContent = 'Escolha uma opção:';
      document.getElementById('sala-lista').innerHTML = '';
      document.getElementById('sala-id-input').value = '';
      listarSalasAbertas();
    });
      // Handlers dos botões de sala
      document.getElementById('btn-criar-sala').addEventListener('click', function() {
        if (!currentUser) { alert('Faça login primeiro.'); return; }
        var nomeSala = (document.getElementById('sala-nome-input').value || '').trim() || currentUser;
        var senhaSala = (document.getElementById('sala-senha-input').value || '').trim();
        criarSala(nomeSala, senhaSala);
      });
      document.getElementById('btn-entrar-id').addEventListener('click', function() {
        if (!currentUser) { alert('Faça login primeiro.'); return; }
        var idSala = (document.getElementById('sala-id-input').value || '').trim();
        if (!idSala) { alert('Digite o ID da sala.'); return; }
        entrarSalaComSenha(idSala, currentUser);
      });
    document.getElementById('btn-ranking').addEventListener('click', function(){ alert('Classificação em breve!'); });
    document.getElementById('btn-titulos').addEventListener('click', openTitles);
    document.getElementById('btn-medalhas').addEventListener('click', openMedals);
    document.getElementById('btn-trofeus').addEventListener('click', function(){ alert('Troféus em breve!'); });
    document.getElementById('btn-amigos').addEventListener('click', function(){ alert('Amigos em breve!'); });
    document.getElementById('btn-skins').addEventListener('click', openSkins);
    document.getElementById('titles-close').addEventListener('click', closeTitles);
    document.getElementById('btn-close-titles').addEventListener('click', closeTitles);
    document.getElementById('titles-overlay').addEventListener('click', function(e){ if (e.target === e.currentTarget) closeTitles(); });
    document.getElementById('medals-close').addEventListener('click', closeMedals);
    document.getElementById('btn-close-medals').addEventListener('click', closeMedals);
    document.getElementById('medals-overlay').addEventListener('click', function(e){ if (e.target === e.currentTarget) closeMedals(); });
    document.getElementById('skins-close').addEventListener('click', closeSkins);
    document.getElementById('btn-close-skins').addEventListener('click', closeSkins);
    document.getElementById('skins-overlay').addEventListener('click', function(e){ if (e.target === e.currentTarget) closeSkins(); });
    document.getElementById('p1').addEventListener('click', function(e) {
      var viewer = 0;
      if (!G.vsIA && e.clientY < window.innerHeight / 2) viewer = 1;
      openInspect(0, viewer);
    });
    document.getElementById('p2').addEventListener('click', function(e) {
      var viewer = 0;
      if (!G.vsIA && e.clientY < window.innerHeight / 2) viewer = 1;
      openInspect(1, viewer);
    });
    document.getElementById('inspect-close').addEventListener('click', closeInspect);
    document.getElementById('btn-close-inspect').addEventListener('click', closeInspect);
    document.getElementById('inspect-overlay').addEventListener('click', function(e){ if (e.target === e.currentTarget) closeInspect(); });
    document.getElementById('btn-close-win').addEventListener('click', function() {
      document.getElementById('win-overlay').classList.remove('show');
      document.getElementById('btn-close-win').style.display = 'none';
      goToLobby();
    });

    function prepararConfiguracao(vsIA) {
      resetAllGameState();
      isOnlineMode = false;
      salaAtual = null;
      if (salaUnsubscribe) { salaUnsubscribe(); salaUnsubscribe = null; }
      if (filaUnsubscribe) { filaUnsubscribe(); filaUnsubscribe = null; }
      if (listaSalasUnsubscribe) { listaSalasUnsubscribe(); listaSalasUnsubscribe = null; }
      jogadorNaFila = false;
      G.vsIA = vsIA;
      G.p1Name = currentUser || 'Player 1';
      G.p2Name = vsIA ? ('IA (' + (G.nivelIA || 'medio').toUpperCase() + ')') : 'Player 2';
      document.getElementById('p1-name-input').value = G.p1Name;
      document.getElementById('p2-name-input').value = G.p2Name;
      document.getElementById('nivel-config').style.display = vsIA ? 'block' : 'none';
      document.getElementById('names-config').style.display = vsIA ? 'none' : 'block';
      if (vsIA && !document.querySelector('#nivel-options button.selected')) {
        document.querySelector('#nivel-options button[data-nivel="medio"]').classList.add('selected');
      }
      updateUndoButtonVisibility();
      showConfig();
    }
    document.getElementById('btnBackMenu').addEventListener('click', function() {
      if (G.over || confirm('Sair da partida atual?')) goToLobby();
    });

    document.querySelectorAll('#time-options button').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('#time-options button').forEach(function(b){ b.classList.remove('selected'); });
        btn.classList.add('selected'); config.time = parseInt(btn.dataset.time);
      });
    });
    document.querySelectorAll('#rounds-options button').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('#rounds-options button').forEach(function(b){ b.classList.remove('selected'); });
        btn.classList.add('selected'); config.rounds = parseInt(btn.dataset.rounds);
      });
    });
    document.querySelectorAll('#nivel-options button').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('#nivel-options button').forEach(function(b){ b.classList.remove('selected'); });
        btn.classList.add('selected');
        G.nivelIA = btn.dataset.nivel;
        G.p2Name = 'IA (' + G.nivelIA.toUpperCase() + ')';
      });
    });
    document.getElementById('btn-start-game').addEventListener('click', function() {
      hideConfig();
      stopTimer(); if (autoResetTimer) clearTimeout(autoResetTimer); if (autoResetTimer2) clearTimeout(autoResetTimer2);
      document.getElementById('win-overlay').classList.remove('show');
      document.getElementById('confetti-container').innerHTML = '';
      document.getElementById('btn-close-win').style.display = 'none';
      if (!G.vsIA) G.p2Name = document.getElementById('p2-name-input').value.trim() || 'Player 2';
      else G.p2Name = 'IA (' + G.nivelIA.toUpperCase() + ')';
      G.p1Name = currentUser || 'Player 1';
      document.getElementById('p1-nome').textContent = G.p1Name;
      document.getElementById('nomeJ2').textContent = G.p2Name;
      document.getElementById('placar-p1').textContent = G.p1Name;
      document.getElementById('placar-p2').textContent = G.p2Name;
      showScreen('game-screen');
      var p2Controls = document.getElementById('p2-controls');
      if (!G.vsIA) { p2Controls.style.display = 'flex'; document.getElementById('game-screen').classList.add('modo-2p'); }
      else { p2Controls.style.display = 'none'; document.getElementById('game-screen').classList.remove('modo-2p'); }
      gameActive = true; matchFinished = false; currentRound = 1; scores = [0,0]; seriesStats = {userWalls:0, userMoves:0};
      atualizarPlacar(); currentTime = config.time;
      positionHistory = [];
      updateUndoButtonVisibility();
      requestAnimationFrame(function() { requestAnimationFrame(function() { resize(); resetGame(); }); });
    });
    document.getElementById('btn-voltar').addEventListener('click', hideConfig);
    document.getElementById('menu-toggle').addEventListener('click', function() {
      document.getElementById('menu-dropdown').classList.toggle('show');
      document.querySelector('.arrow').classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!document.getElementById('menu-container').contains(e.target)) {
        document.getElementById('menu-dropdown').classList.remove('show');
        document.querySelector('.arrow').classList.remove('open');
      }
    });
    document.getElementById('btnUndo').addEventListener('click', undo);
    document.getElementById('btnReset').addEventListener('click', function() {
      stopTimer(); if (autoResetTimer) clearTimeout(autoResetTimer); if (autoResetTimer2) clearTimeout(autoResetTimer2);
      document.getElementById('win-overlay').classList.remove('show');
      document.getElementById('btn-close-win').style.display = 'none';
      scores = [0,0]; currentRound = 1; seriesStats = {userWalls:0, userMoves:0}; atualizarPlacar();
      gameActive = true; matchFinished = false; reset();
    });
    document.getElementById('btnStats').addEventListener('click', function() {
      var s = getStats();
      document.getElementById('stats-content').innerHTML = '<div style="color:#b8a99a;font-size:13px;line-height:1.8">Partidas: <b style="color:#f0e6d3">' + s.games + '</b><br>Vitórias: <b style="color:#10b981">' + s.wins + '</b><br>Derrotas: <b style="color:#e94560">' + s.losses + '</b><br>Sequência: <b style="color:#d4a373">' + s.streak + '</b></div>';
      document.getElementById('stats-overlay').classList.add('show');
      document.getElementById('menu-dropdown').classList.remove('show');
    });
    document.getElementById('btn-close-stats').addEventListener('click', function() { document.getElementById('stats-overlay').classList.remove('show'); });
    canvas.addEventListener('click', handleTap);
    canvas.addEventListener('touchstart', handleTap, {passive:false});
    canvas.addEventListener('mousemove', handleHover);
    canvas.addEventListener('touchmove', function(e){ e.preventDefault(); handleHover(e); }, {passive:false});
    canvas.addEventListener('mouseleave', function() { if (G.hoverNode) { G.hoverNode = null; draw(); } });
    document.getElementById('btnH').addEventListener('click', function(){ setMode(G.mode === 'H' ? 'move' : 'H'); });
    document.getElementById('btnV').addEventListener('click', function(){ setMode(G.mode === 'V' ? 'move' : 'V'); });
    document.getElementById('btnH2').addEventListener('click', function(){ setMode(G.mode === 'H' ? 'move' : 'H'); });
    document.getElementById('btnV2').addEventListener('click', function(){ setMode(G.mode === 'V' ? 'move' : 'V'); });

    function updateUndoButtonVisibility() {
      var btnUndo = document.getElementById('btnUndo');
      if (btnUndo) btnUndo.style.display = G.vsIA ? 'none' : 'block';
    }

    window.addEventListener('load', function() {
      resize(); initPips();
      document.querySelector('#time-options button[data-time="30"]').classList.add('selected');
      document.querySelector('#rounds-options button[data-rounds="1"]').classList.add('selected');
      var mid = document.querySelector('#nivel-options button[data-nivel="medio"]');
      if (mid) mid.classList.add('selected');
      showScreen('login-screen');
    });
    window.addEventListener('resize', function() {
      if (document.getElementById('game-screen').classList.contains('active')) { resize(); draw(); }
    });
    
function drawAnimatedPreviews() {
  var canvases = document.querySelectorAll('.skin-preview-canvas');
  for (var i = 0; i < canvases.length; i++) {
    var canvas = canvases[i];
    if (canvas._skin && canvas._skin.efeito) {
      drawSkinPreview(canvas, canvas._skin);
    }
  }
}
function loop() {
      drawAnimatedPreviews();
      var needDraw = G.over || G.hoverNode || G.iaThinking;
      if (!needDraw && currentUser) {
        var eq = getStats().equippedSkin;
        var sk = SKINS.find(function(s){ return s.id === eq; });
        if (sk && (sk.raridade === 'lendaria' || sk.raridade === 'rara')) needDraw = true;
      }
      if (needDraw) draw();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  

    document.addEventListener('DOMContentLoaded', function() {
      function fecharSalaOverlay() {
        var overlay = document.getElementById('sala-overlay');
        if (overlay) overlay.classList.remove('show');
        if (typeof limparOnline === 'function') limparOnline();
      }

      var salaClose = document.getElementById('sala-close');
      if (salaClose) {
        var newClose = salaClose.cloneNode(true);
        salaClose.parentNode.replaceChild(newClose, salaClose);
        newClose.addEventListener('click', fecharSalaOverlay);
      }

      var btnCloseSala = document.getElementById('btn-close-sala');
      if (btnCloseSala) {
        var newBtn = btnCloseSala.cloneNode(true);
        btnCloseSala.parentNode.replaceChild(newBtn, btnCloseSala);
        newBtn.addEventListener('click', fecharSalaOverlay);
      }

      var overlay = document.getElementById('sala-overlay');
      if (overlay) {
        overlay.addEventListener('click', function(e) {
          if (e.target === e.currentTarget) fecharSalaOverlay();
        });
      }
    });
  

(function(){
  function abrirChat(){ document.getElementById('chat-overlay').classList.add('show'); }
  function fecharChat(){ document.getElementById('chat-overlay').classList.remove('show'); }
  function abrirGuilda(){ document.getElementById('guilda-overlay').classList.add('show'); }
  function fecharGuilda(){ document.getElementById('guilda-overlay').classList.remove('show'); }

  // Botões do menu
  var btnChat = document.getElementById('btn-chat');
  if(btnChat) btnChat.addEventListener('click', abrirChat);
  var btnGuilda = document.getElementById('btn-guilda');
  if(btnGuilda) btnGuilda.addEventListener('click', abrirGuilda);

  // Fechar
  var closeChat = document.getElementById('chat-close');
  if(closeChat) closeChat.addEventListener('click', fecharChat);
  var closeGuilda = document.getElementById('guilda-close');
  if(closeGuilda) closeGuilda.addEventListener('click', fecharGuilda);
  var btnCloseChat = document.getElementById('btn-close-chat');
  if(btnCloseChat) btnCloseChat.addEventListener('click', fecharChat);
  var btnCloseGuilda = document.getElementById('btn-close-guilda');
  if(btnCloseGuilda) btnCloseGuilda.addEventListener('click', fecharGuilda);

  // Fechar ao clicar fora
  document.getElementById('chat-overlay').addEventListener('click', function(e){ if(e.target === e.currentTarget) fecharChat(); });
  document.getElementById('guilda-overlay').addEventListener('click', function(e){ if(e.target === e.currentTarget) fecharGuilda(); });

  // Abas do chat
  var tabs = document.querySelectorAll('.chat-tab');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ t.classList.remove('active'); });
      this.classList.add('active');
      var alvo = this.getAttribute('data-tab');
      document.querySelectorAll('.chat-pane').forEach(function(pane){
        pane.classList.remove('active');
      });
      document.getElementById('chat-' + alvo).classList.add('active');
    });
  });
})();


(function(){
  // Gerar partículas douradas
  function criarParticula() {
    var container = document.getElementById('particulas-container');
    if (!container) return;
    var p = document.createElement('div');
    p.className = 'particula';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = (100 + Math.random() * 20) + '%';
    p.style.animationDuration = (Math.random() * 8 + 6) + 's';
    p.style.animationDelay = (Math.random() * 2) + 's';
    p.style.width = (Math.random() * 6 + 2) + 'px';
    p.style.height = p.style.width;
    container.appendChild(p);
    setTimeout(function(){ p.remove(); }, 15000);
  }
  setInterval(criarParticula, 800);

  // Dicas de estratégia aleatórias
  var dicas = [
    'Dica: Paredes bem colocadas valem mais que pressa.',
    'Dica: Bloquear o caminho do oponente pode garantir a vitória.',
    'Dica: Economize paredes para o final do jogo.',
    'Dica: O centro do tabuleiro é o coração da estratégia.',
    'Dica: Cada movimento deve ter um propósito.',
    'Dica: Antecipe os saltos do adversário.'
  ];
  var dicaEl = document.getElementById('login-dica');
  if (dicaEl) {
    setInterval(function() {
      var novaDica = dicas[Math.floor(Math.random() * dicas.length)];
      dicaEl.style.opacity = 0;
      setTimeout(function() {
        dicaEl.textContent = novaDica;
        dicaEl.style.opacity = 1;
      }, 500);
    }, 5000);
  }
})();

deviceId = getDeviceId();


// ===== WRAPPER LOGIN EXCLUSIVO =====
(function () {
    if (typeof loginUser === 'function') {
        var originalLogin = loginUser;
        loginUser = async function (username, password) {
            username = String(username || '').trim();
            password = String(password || '');
            // Chama original primeiro (autentica)
            var ok = await originalLogin(username, password);
            if (!ok) return false;
            var uid = (firebase.auth().currentUser && firebase.auth().currentUser.uid) || window.currentUserId;
            if (uid) {
                var sessionRef = db.collection('sessions').doc(uid);
                var snap = await sessionRef.get();
                if (snap.exists) {
                    var data = snap.data();
                    if (data.deviceId && data.deviceId !== deviceId && data.lastSeen && (Date.now() - data.lastSeen) < SESSION_TIMEOUT) {
                        window.lastAuthError = 'Esta conta já está online em outro dispositivo.';
                        try { await firebase.auth().signOut(); } catch (e) {}
                        currentUser = null;
                        window.currentUserId = null;
                        if (sessionUpdateInterval) clearInterval(sessionUpdateInterval);
                        var el = document.getElementById('login-error');
                        if (el) el.textContent = window.lastAuthError;
                        return false;
                    }
                }
                await sessionRef.set({ deviceId: deviceId, lastSeen: Date.now() }, { merge: true });
                window.currentUserId = uid;
                startSessionAlive();
            }
            return true;
        };
    }
})();


// ===== WRAPPER CREATE USER SESSÃO =====
(function () {
    if (typeof createUser === 'function') {
        var originalCreate = createUser;
        createUser = async function (username, password) {
            var ok = await originalCreate(username, password);
            if (!ok) return false;
            var uid = (firebase.auth().currentUser && firebase.auth().currentUser.uid) || window.currentUserId;
            if (uid) {
                await db.collection('sessions').doc(uid).set({ deviceId: deviceId, lastSeen: Date.now() }, { merge: true });
                window.currentUserId = uid;
                startSessionAlive();
            }
            return true;
        };
    }
})();


// ===== WRAPPER LOGOUT REMOVE SESSÃO =====
(function () {
    if (typeof logoutUser === 'function') {
        var originalLogout = logoutUser;
        logoutUser = async function () {
            try {
                if (firebase.auth().currentUser) {
                    var uid = firebase.auth().currentUser.uid;
                    await db.collection('sessions').doc(uid).delete();
                }
            } catch (e) { console.error('Erro ao remover sessão:', e); }
            if (sessionUpdateInterval) clearInterval(sessionUpdateInterval);
            return await originalLogout.apply(this, arguments);
        };
    }
})();


// ===== HEARTBEAT SESSÃO =====
window.addEventListener('load', function () {
    setInterval(function () {
        if (currentUser && window.currentUserId && firebase.auth().currentUser) {
            db.collection('sessions').doc(window.currentUserId).set({
                deviceId: deviceId,
                lastSeen: Date.now()
            }, { merge: true }).catch(console.error);
        }
    }, 30000);
});

window.addEventListener('beforeunload', function () {
    if (currentUser && window.currentUserId) {
        db.collection('sessions').doc(window.currentUserId).delete().catch(function () {});
    }
});


// ===== CONTROLE DE TELA INICIAL =====
(function () {
    var loginScreen = document.getElementById('login-screen');
    var modeScreen = document.getElementById('mode-screen');
    var loginManual = false;

    if (loginScreen && modeScreen) {
        // Se por qualquer motivo mode-screen estiver ativa sem login, volta para login
        function verificarTela() {
            if (!loginManual && modeScreen.classList.contains('active')) {
                modeScreen.classList.remove('active');
                loginScreen.classList.add('active');
            }
        }
        var interval = setInterval(verificarTela, 300);
        setTimeout(function () { clearInterval(interval); }, 3000);

        // Marca login manual quando goToModeScreen for chamado
        var originalGoToModeScreen = window.goToModeScreen || goToModeScreen;
        if (typeof originalGoToModeScreen === 'function') {
            window.goToModeScreen = function (username) {
                loginManual = true;
                originalGoToModeScreen(username);
            };
        }
    }
})();


// ===================== SKINS DE PAÍSES =====================
var COUNTRY_SKINS = [{"id":"country_af","nome":"Afeganistão","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇦🇫"},{"id":"country_za","nome":"África do Sul","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇿🇦"},{"id":"country_al","nome":"Albânia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇦🇱"},{"id":"country_de","nome":"Alemanha","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇩🇪"},{"id":"country_ad","nome":"Andorra","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇦🇩"},{"id":"country_ao","nome":"Angola","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇦🇴"},{"id":"country_ag","nome":"Antígua e Barbuda","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇦🇬"},{"id":"country_sa","nome":"Arábia Saudita","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇦"},{"id":"country_dz","nome":"Argélia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇩🇿"},{"id":"country_ar","nome":"Argentina","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇦🇷"},{"id":"country_am","nome":"Armênia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇦🇲"},{"id":"country_au","nome":"Austrália","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇦🇺"},{"id":"country_at","nome":"Áustria","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇦🇹"},{"id":"country_az","nome":"Azerbaijão","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇦🇿"},{"id":"country_bs","nome":"Bahamas","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇸"},{"id":"country_bd","nome":"Bangladesh","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇩"},{"id":"country_bb","nome":"Barbados","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇧"},{"id":"country_bh","nome":"Barém","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇭"},{"id":"country_be","nome":"Bélgica","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇪"},{"id":"country_bz","nome":"Belize","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇿"},{"id":"country_bj","nome":"Benin","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇯"},{"id":"country_by","nome":"Bielorrússia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇾"},{"id":"country_bo","nome":"Bolívia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇴"},{"id":"country_ba","nome":"Bósnia e Herzegovina","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇦"},{"id":"country_bw","nome":"Botsuana","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇼"},{"id":"country_br","nome":"Brasil","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇷"},{"id":"country_bn","nome":"Brunei","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇳"},{"id":"country_bg","nome":"Bulgária","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇬"},{"id":"country_bf","nome":"Burkina Faso","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇫"},{"id":"country_bi","nome":"Burundi","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇮"},{"id":"country_bt","nome":"Butão","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇧🇹"},{"id":"country_cv","nome":"Cabo Verde","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇻"},{"id":"country_cm","nome":"Camarões","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇲"},{"id":"country_kh","nome":"Camboja","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇰🇭"},{"id":"country_ca","nome":"Canadá","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇦"},{"id":"country_qa","nome":"Catar","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇶🇦"},{"id":"country_td","nome":"Chade","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇹🇩"},{"id":"country_cl","nome":"Chile","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇱"},{"id":"country_cn","nome":"China","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇳"},{"id":"country_cy","nome":"Chipre","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇾"},{"id":"country_co","nome":"Colômbia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇴"},{"id":"country_km","nome":"Comores","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇰🇲"},{"id":"country_cg","nome":"Congo","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇬"},{"id":"country_kp","nome":"Coreia do Norte","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇰🇵"},{"id":"country_kr","nome":"Coreia do Sul","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇰🇷"},{"id":"country_ci","nome":"Costa do Marfim","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇮"},{"id":"country_cr","nome":"Costa Rica","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇷"},{"id":"country_hr","nome":"Croácia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇭🇷"},{"id":"country_cu","nome":"Cuba","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇺"},{"id":"country_dk","nome":"Dinamarca","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇩🇰"},{"id":"country_dj","nome":"Djibouti","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇩🇯"},{"id":"country_dm","nome":"Dominica","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇩🇲"},{"id":"country_eg","nome":"Egito","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇪🇬"},{"id":"country_sv","nome":"El Salvador","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇻"},{"id":"country_ae","nome":"Emirados Árabes Unidos","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇦🇪"},{"id":"country_ec","nome":"Equador","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇪🇨"},{"id":"country_er","nome":"Eritreia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇪🇷"},{"id":"country_sk","nome":"Eslováquia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇰"},{"id":"country_si","nome":"Eslovênia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇮"},{"id":"country_es","nome":"Espanha","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇪🇸"},{"id":"country_us","nome":"Estados Unidos","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇺🇸"},{"id":"country_ee","nome":"Estônia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇪🇪"},{"id":"country_et","nome":"Etiópia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇪🇹"},{"id":"country_fj","nome":"Fiji","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇫🇯"},{"id":"country_ph","nome":"Filipinas","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇵🇭"},{"id":"country_fi","nome":"Finlândia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇫🇮"},{"id":"country_fr","nome":"França","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇫🇷"},{"id":"country_ga","nome":"Gabão","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇬🇦"},{"id":"country_gm","nome":"Gâmbia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇬🇲"},{"id":"country_gh","nome":"Gana","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇬🇭"},{"id":"country_ge","nome":"Geórgia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇬🇪"},{"id":"country_gd","nome":"Granada","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇬🇩"},{"id":"country_gr","nome":"Grécia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇬🇷"},{"id":"country_gt","nome":"Guatemala","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇬🇹"},{"id":"country_gy","nome":"Guiana","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇬🇾"},{"id":"country_gn","nome":"Guiné","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇬🇳"},{"id":"country_gw","nome":"Guiné-Bissau","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇬🇼"},{"id":"country_gq","nome":"Guiné Equatorial","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇬🇶"},{"id":"country_ht","nome":"Haiti","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇭🇹"},{"id":"country_hn","nome":"Honduras","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇭🇳"},{"id":"country_hu","nome":"Hungria","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇭🇺"},{"id":"country_ye","nome":"Iémen","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇾🇪"},{"id":"country_mh","nome":"Ilhas Marshall","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇭"},{"id":"country_in","nome":"Índia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇮🇳"},{"id":"country_id","nome":"Indonésia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇮🇩"},{"id":"country_iq","nome":"Iraque","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇮🇶"},{"id":"country_ir","nome":"Irã","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇮🇷"},{"id":"country_ie","nome":"Irlanda","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇮🇪"},{"id":"country_is","nome":"Islândia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇮🇸"},{"id":"country_il","nome":"Israel","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇮🇱"},{"id":"country_it","nome":"Itália","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇮🇹"},{"id":"country_jm","nome":"Jamaica","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇯🇲"},{"id":"country_jp","nome":"Japão","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇯🇵"},{"id":"country_jo","nome":"Jordânia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇯🇴"},{"id":"country_kw","nome":"Kuwait","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇰🇼"},{"id":"country_la","nome":"Laos","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇱🇦"},{"id":"country_ls","nome":"Lesoto","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇱🇸"},{"id":"country_lv","nome":"Letônia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇱🇻"},{"id":"country_lb","nome":"Líbano","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇱🇧"},{"id":"country_lr","nome":"Libéria","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇱🇷"},{"id":"country_ly","nome":"Líbia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇱🇾"},{"id":"country_li","nome":"Liechtenstein","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇱🇮"},{"id":"country_lt","nome":"Lituânia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇱🇹"},{"id":"country_lu","nome":"Luxemburgo","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇱🇺"},{"id":"country_mk","nome":"Macedônia do Norte","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇰"},{"id":"country_mg","nome":"Madagascar","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇬"},{"id":"country_my","nome":"Malásia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇾"},{"id":"country_mw","nome":"Malawi","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇼"},{"id":"country_mv","nome":"Maldivas","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇻"},{"id":"country_ml","nome":"Mali","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇱"},{"id":"country_mt","nome":"Malta","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇹"},{"id":"country_ma","nome":"Marrocos","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇦"},{"id":"country_mu","nome":"Maurício","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇺"},{"id":"country_mr","nome":"Mauritânia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇷"},{"id":"country_mx","nome":"México","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇽"},{"id":"country_mm","nome":"Mianmar","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇲"},{"id":"country_fm","nome":"Micronésia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇫🇲"},{"id":"country_mz","nome":"Moçambique","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇿"},{"id":"country_md","nome":"Moldávia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇩"},{"id":"country_mc","nome":"Mônaco","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇨"},{"id":"country_mn","nome":"Mongólia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇳"},{"id":"country_me","nome":"Montenegro","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇲🇪"},{"id":"country_na","nome":"Namíbia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇳🇦"},{"id":"country_nr","nome":"Nauru","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇳🇷"},{"id":"country_np","nome":"Nepal","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇳🇵"},{"id":"country_ni","nome":"Nicarágua","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇳🇮"},{"id":"country_ne","nome":"Níger","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇳🇪"},{"id":"country_ng","nome":"Nigéria","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇳🇬"},{"id":"country_no","nome":"Noruega","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇳🇴"},{"id":"country_nz","nome":"Nova Zelândia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇳🇿"},{"id":"country_om","nome":"Omã","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇴🇲"},{"id":"country_nl","nome":"Países Baixos","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇳🇱"},{"id":"country_pw","nome":"Palau","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇵🇼"},{"id":"country_pa","nome":"Panamá","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇵🇦"},{"id":"country_pg","nome":"Papua Nova Guiné","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇵🇬"},{"id":"country_pk","nome":"Paquistão","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇵🇰"},{"id":"country_py","nome":"Paraguai","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇵🇾"},{"id":"country_pe","nome":"Peru","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇵🇪"},{"id":"country_pl","nome":"Polônia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇵🇱"},{"id":"country_pt","nome":"Portugal","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇵🇹"},{"id":"country_ke","nome":"Quênia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇰🇪"},{"id":"country_kg","nome":"Quirguistão","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇰🇬"},{"id":"country_gb","nome":"Reino Unido","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇬🇧"},{"id":"country_cf","nome":"República Centro-Africana","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇫"},{"id":"country_cd","nome":"República Democrática do Congo","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇩"},{"id":"country_do","nome":"República Dominicana","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇩🇴"},{"id":"country_cz","nome":"República Tcheca","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇿"},{"id":"country_ro","nome":"Romênia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇷🇴"},{"id":"country_rw","nome":"Ruanda","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇷🇼"},{"id":"country_ru","nome":"Rússia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇷🇺"},{"id":"country_ws","nome":"Samoa","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇼🇸"},{"id":"country_sm","nome":"San Marino","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇲"},{"id":"country_lc","nome":"Santa Lúcia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇱🇨"},{"id":"country_kn","nome":"São Cristóvão e Nevis","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇰🇳"},{"id":"country_st","nome":"São Tomé e Príncipe","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇹"},{"id":"country_vc","nome":"São Vicente e Granadinas","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇻🇨"},{"id":"country_sc","nome":"Seicheles","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇨"},{"id":"country_sn","nome":"Senegal","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇳"},{"id":"country_sl","nome":"Serra Leoa","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇱"},{"id":"country_rs","nome":"Sérvia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇷🇸"},{"id":"country_sg","nome":"Singapura","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇬"},{"id":"country_sy","nome":"Síria","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇾"},{"id":"country_so","nome":"Somália","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇴"},{"id":"country_lk","nome":"Sri Lanka","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇱🇰"},{"id":"country_sz","nome":"Suazilândia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇿"},{"id":"country_sd","nome":"Sudão","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇩"},{"id":"country_ss","nome":"Sudão do Sul","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇸"},{"id":"country_se","nome":"Suécia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇪"},{"id":"country_ch","nome":"Suíça","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇨🇭"},{"id":"country_sr","nome":"Suriname","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇸🇷"},{"id":"country_th","nome":"Tailândia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇹🇭"},{"id":"country_tz","nome":"Tanzânia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇹🇿"},{"id":"country_tj","nome":"Tadjiquistão","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇹🇯"},{"id":"country_tl","nome":"Timor-Leste","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇹🇱"},{"id":"country_tg","nome":"Togo","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇹🇬"},{"id":"country_to","nome":"Tonga","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇹🇴"},{"id":"country_tt","nome":"Trinidad e Tobago","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇹🇹"},{"id":"country_tn","nome":"Tunísia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇹🇳"},{"id":"country_tm","nome":"Turcomenistão","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇹🇲"},{"id":"country_tr","nome":"Turquia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇹🇷"},{"id":"country_tv","nome":"Tuvalu","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇹🇻"},{"id":"country_ua","nome":"Ucrânia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇺🇦"},{"id":"country_ug","nome":"Uganda","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇺🇬"},{"id":"country_uy","nome":"Uruguai","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇺🇾"},{"id":"country_uz","nome":"Uzbequistão","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇺🇿"},{"id":"country_vu","nome":"Vanuatu","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇻🇺"},{"id":"country_va","nome":"Vaticano","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇻🇦"},{"id":"country_ve","nome":"Venezuela","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇻🇪"},{"id":"country_vn","nome":"Vietnã","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇻🇳"},{"id":"country_zm","nome":"Zâmbia","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇿🇲"},{"id":"country_zw","nome":"Zimbábue","forma":"circle","cor1":"#ffffff","cor2":"#cccccc","preco":1000,"categoria":"paises","emoji":"🇿🇼"}];
SKINS = SKINS.concat(COUNTRY_SKINS);

// Wrapper para desenhar bandeiras nos peões
(function () {
    if (typeof drawSkinPreview === 'function') {
        var originalDrawPreview = drawSkinPreview;
        drawSkinPreview = function (canvas, skin) {
            if (skin && skin.emoji) {
                drawFlagPreview(canvas, skin);
                return;
            }
            originalDrawPreview(canvas, skin);
        };
    }

    if (typeof drawPawn === 'function') {
        var originalDrawPawn = drawPawn;
        drawPawn = function (p, x, y, rad, active, rotateText) {
            // Obtém a skin do peão (apenas para o jogador 0)
            var skin = null;
            if (p === 0 && currentUser) {
                var stats = getStats();
                skin = SKINS.find(function(s) { return s.id === stats.equippedSkin; });
            }
            if (skin && skin.emoji) {
                drawFlagPawn(p, x, y, rad, active, rotateText, skin);
                return;
            }
            originalDrawPawn.apply(this, arguments);
        };
    }
})();

// Funções de desenho de bandeira
function drawFlagPreview(canvas, skin) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    canvas.width = 48; canvas.height = 48;
    ctx.clearRect(0, 0, 48, 48);
    var x = 24, y = 24, rad = 14;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(skin.emoji, x, y + 1);
}

function drawFlagPawn(p, x, y, rad, active, rotateText, skin) {
    var ctx = canvas.getContext('2d');
    ctx.save();
    if (active) {
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = active ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = (rad * 1.4) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(skin.emoji, x, y);
    ctx.restore();
}






// ===================== SKINS DE PAÍSES (BANDEIRAS REAIS CORRIGIDAS) =====================
var countryFlagCache = {};
var countryFlagLoading = {};

function getFlagUrl(skin) {
    var code = skin.id.replace('country_', '').toUpperCase();
    return 'https://flagcdn.com/w1280/' + code.toLowerCase() + '.png';
}

function loadFlagImage(skin, callback) {
    if (countryFlagCache[skin.id] !== undefined) {
        callback(countryFlagCache[skin.id]);
        return;
    }
    if (countryFlagLoading[skin.id]) {
        // já está carregando, espera
        setTimeout(function() { loadFlagImage(skin, callback); }, 50);
        return;
    }
    countryFlagLoading[skin.id] = true;
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        countryFlagCache[skin.id] = img;
        delete countryFlagLoading[skin.id];
        callback(img);
    };
    img.onerror = function() {
        countryFlagCache[skin.id] = null;
        delete countryFlagLoading[skin.id];
        callback(null);
    };
    img.src = getFlagUrl(skin);
}

function drawFlagPawnReal(skin, p, x, y, rad, active) {
    loadFlagImage(skin, function(img) {
        var ctx = canvas.getContext('2d');
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.clip();
        if (img) {
            ctx.drawImage(img, x - rad, y - rad, rad * 2, rad * 2);
        } else {
            ctx.fillStyle = '#777';
            ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        // Sombra interna
        var grad = ctx.createRadialGradient(x - rad * 0.3, y - rad * 0.3, rad * 0.05, x, y, rad);
        grad.addColorStop(0, 'rgba(255,255,255,0.25)');
        grad.addColorStop(0.6, 'rgba(0,0,0,0.1)');
        grad.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        ctx.restore();
        // Número do peão
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 6;
        ctx.font = 'bold ' + (rad * 0.8) + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(p + 1), x, y);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    });
}

(function () {
    if (typeof drawPawn === 'function') {
        var originalDrawPawn = drawPawn;
        drawPawn = function (p, x, y, rad, active, rotateText) {
            var skin = null;
            if (p === 0 && currentUser) {
                var stats = getStats();
                skin = SKINS.find(function(s) { return s.id === stats.equippedSkin; });
            }
            if (skin && skin.categoria === 'paises') {
                drawFlagPawnReal(skin, p, x, y, rad, active);
                return;
            }
            originalDrawPawn.apply(this, arguments);
        };
    }
})();

(function () {
    if (typeof drawSkinPreview === 'function') {
        var originalDrawPreview = drawSkinPreview;
        drawSkinPreview = function (canvas, skin) {
            if (skin && skin.categoria === 'paises') {
                loadFlagImage(skin, function(img) {
                    var ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2 - 1, 0, Math.PI*2);
                    ctx.clip();
                    if (img) {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    } else {
                        ctx.fillStyle = '#777';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                    ctx.restore();
                });
                return;
            }
            originalDrawPreview(canvas, skin);
        };
    }
})();
// ===================== FIM SKINS DE PAÍSES (BANDEIRAS REAIS CORRIGIDAS) =====================







// ===================== FIX ID DO USUÁRIO =====================
(function () {
    function atualizarCurrentUserId() {
        try {
            if (!window.currentUserId && firebase.auth().currentUser) {
                window.currentUserId = firebase.auth().currentUser.uid;
            }
            if (!window.currentUserId && typeof currentUser === 'string' && currentUser) {
                var accounts = getAccounts();
                if (accounts[currentUser] && accounts[currentUser].uid) {
                    window.currentUserId = accounts[currentUser].uid;
                }
            }
        } catch (e) {}
    }

    // Atualiza imediatamente e ao abrir perfil
    function interceptOpenProfile() {
        atualizarCurrentUserId();
        try {
            var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
            var idBox = document.getElementById('profile-userid');
            if (idBox) {
                if (uid) {
                    idBox.textContent = 'ID: ' + uid;
                    idBox.style.cursor = 'pointer';
                    idBox.title = 'Clique para copiar';
                } else {
                    idBox.textContent = 'ID: não identificado';
                }
            }
        } catch (e) {}
    }

    if (typeof openProfile === 'function') {
        var originalOpenProfile = openProfile;
        openProfile = function () {
            interceptOpenProfile();
            originalOpenProfile.apply(this, arguments);
        };
    }

    // Adiciona evento de copiar ID
    function wireCopyId() {
        var el = document.getElementById('profile-userid');
        if (!el || el.dataset.copyWired === '1') return;
        el.dataset.copyWired = '1';
        el.addEventListener('click', function () {
            var text = (el.textContent || '').replace('ID: ', '').trim();
            if (!text || text === '—') return;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    el.textContent = 'ID copiado!';
                    setTimeout(function () { el.textContent = 'ID: ' + text; }, 1200);
                }).catch(function () {});
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            atualizarCurrentUserId();
            wireCopyId();
        });
        window.addEventListener('load', function () {
            atualizarCurrentUserId();
            wireCopyId();
        });
    } else {
        atualizarCurrentUserId();
        wireCopyId();
    }

    // Reforço ao abrir o perfil via clique no avatar
    var userInfo = document.getElementById('user-info-profile');
    if (userInfo) {
        userInfo.addEventListener('click', function () {
            atualizarCurrentUserId();
            var uid = window.currentUserId;
            var idBox = document.getElementById('profile-userid');
            if (idBox && uid) {
                idBox.textContent = 'ID: ' + uid;
            }
        });
    }
})();
// ===================== FIM FIX ID DO USUÁRIO =====================







/* ===== IA_EXPERT_INVENCIVEL_V1 ===== */
/* Expert: prioriza bloquear caminho do humano, encurtar o próprio, paredes ofensivas/defensivas */
(function () {
  if (typeof window === "undefined") return;

  function pathLen(playerIndex) {
    // usa BFS no grid 9x9 respeitando G.pH / G.pV se existir helper; senao heuristica
    if (typeof shortestPathLength === "function") {
      try { return shortestPathLength(playerIndex); } catch (e) {}
    }
    if (typeof getPathLength === "function") {
      try { return getPathLength(playerIndex); } catch (e) {}
    }
    // fallback: distancia de linha ate a meta
    if (!G || !G.pos) return 99;
    if (playerIndex === 0) return G.pos[0][0]; // P1 sobe -> row 0
    return 8 - G.pos[1][0]; // P2 desce -> row 8
  }

  function cloneWalls() {
    return {
      pH: (G.pH || []).map(function (w) { return [w[0], w[1]]; }),
      pV: (G.pV || []).map(function (w) { return [w[0], w[1]]; }),
      walls: [G.walls[0], G.walls[1]]
    };
  }

  function scorePosition() {
    // AI e index 1 quando vsIA
    var my = 1, opp = 0;
    var myPath = pathLen(my);
    var oppPath = pathLen(opp);
    // quanto menor meu caminho melhor; quanto maior o do oponente melhor
    var s = (oppPath - myPath) * 12;
    s += (G.walls[my] - G.walls[opp]) * 0.5;
    // bonus se oponente esta quase na meta e conseguimos alongar
    if (oppPath <= 2) s += 30;
    if (myPath <= 2) s += 25;
    if (oppPath <= 1) s += 50;
    return s;
  }

  function legalMovesAI() {
    if (typeof getValidMoves === "function") {
      try { return getValidMoves(1) || []; } catch (e) {}
    }
    if (typeof computeValid === "function") {
      try {
        var t = G.turn;
        G.turn = 1;
        computeValid();
        var moves = (G.validMoves || G.moves || []).slice();
        G.turn = t;
        return moves;
      } catch (e) {}
    }
    // fallback 4 direcoes
    var r = G.pos[1][0], c = G.pos[1][1];
    var out = [];
    [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(function (p) {
      if (p[0] >= 0 && p[0] < 9 && p[1] >= 0 && p[1] < 9) out.push(p);
    });
    return out;
  }

  function tryMove(r, c) {
    if (typeof doMove === "function") return doMove(r, c);
    if (typeof movePawn === "function") return movePawn(1, r, c);
    G.pos[1][0] = r; G.pos[1][1] = c;
    return true;
  }

  function tryWall(r, c, ori) {
    if (typeof placeWall === "function") return placeWall(r, c, ori);
    if (typeof canPlaceWall === "function" && !canPlaceWall(r, c, ori)) return false;
    if (ori === "H" || ori === "h") {
      G.pH.push([r, c]);
      if (G.wallOwnerH) G.wallOwnerH.push(1);
    } else {
      G.pV.push([r, c]);
      if (G.wallOwnerV) G.wallOwnerV.push(1);
    }
    G.walls[1]--;
    return true;
  }

  function undoLastWall(ori) {
    if (ori === "H" || ori === "h") {
      G.pH.pop();
      if (G.wallOwnerH) G.wallOwnerH.pop();
    } else {
      G.pV.pop();
      if (G.wallOwnerV) G.wallOwnerV.pop();
    }
    G.walls[1]++;
  }

  function evaluateWallCandidates() {
    var best = null;
    var bestScore = -1e9;
    if (G.walls[1] <= 0) return null;
    var r, c, ori, ok, sc;
    var oris = ["H", "V"];
    // varre intersecoes 0..7
    for (r = 0; r < 8; r++) {
      for (c = 0; c < 8; c++) {
        for (var oi = 0; oi < 2; oi++) {
          ori = oris[oi];
          // testa se caminho continua existindo
          var beforeOpp = pathLen(0);
          var beforeMe = pathLen(1);
          var placed = false;
          try {
            if (typeof canPlaceWall === "function") {
              if (!canPlaceWall(r, c, ori)) continue;
            }
            // simula
            if (ori === "H") {
              if ((G.pH || []).some(function (w) { return w[0] === r && w[1] === c; })) continue;
              G.pH.push([r, c]);
              if (G.wallOwnerH) G.wallOwnerH.push(1);
            } else {
              if ((G.pV || []).some(function (w) { return w[0] === r && w[1] === c; })) continue;
              G.pV.push([r, c]);
              if (G.wallOwnerV) G.wallOwnerV.push(1);
            }
            G.walls[1]--;
            placed = true;
            // paths ainda existem?
            var afterOpp = pathLen(0);
            var afterMe = pathLen(1);
            if (afterOpp >= 99 || afterMe >= 99) {
              // invalido se bloqueia totalmente (regras Quoridor)
              undoLastWall(ori);
              placed = false;
              continue;
            }
            sc = (afterOpp - beforeOpp) * 20 + (beforeMe - afterMe) * 14;
            // expert: paredes so se alongam oponente de verdade ou salvam
            if (afterOpp <= beforeOpp && afterMe >= beforeMe) sc -= 40;
            if (beforeOpp <= 3 && afterOpp > beforeOpp) sc += 40;
            if (sc > bestScore) {
              bestScore = sc;
              best = { type: "wall", r: r, c: c, ori: ori, score: sc };
            }
            undoLastWall(ori);
            placed = false;
          } catch (e) {
            if (placed) undoLastWall(ori);
          }
        }
      }
    }
    if (best && best.score >= 8) return best;
    return null;
  }

  function evaluateMoves() {
    var moves = legalMovesAI();
    var best = null;
    var bestScore = -1e9;
    var i, m, pr, pc, sc;
    pr = G.pos[1][0];
    pc = G.pos[1][1];
    for (i = 0; i < moves.length; i++) {
      m = moves[i];
      var nr = Array.isArray(m) ? m[0] : m.r;
      var nc = Array.isArray(m) ? m[1] : m.c;
      G.pos[1][0] = nr;
      G.pos[1][1] = nc;
      sc = scorePosition();
      // preferir avancar em direcao a meta (row 8)
      sc += (nr - pr) * 3;
      if (nr === 8) sc += 1000;
      if (sc > bestScore) {
        bestScore = sc;
        best = { type: "move", r: nr, c: nc, score: sc };
      }
      G.pos[1][0] = pr;
      G.pos[1][1] = pc;
    }
    return best;
  }

  function aiExpertDecide() {
    if (!G || G.over || G.vsIA === false) return null;
    // 1) se posso ganhar andando, ando
    var move = evaluateMoves();
    if (move && move.r === 8) return move;
    // 2) parede se prejudica humano de verdade
    var wall = evaluateWallCandidates();
    var opp = pathLen(0);
    var me = pathLen(1);
    // expert usa parede com frequencia alta quando humano esta na frente ou perto
    if (wall && (opp <= me + 1 || opp <= 4 || G.walls[1] >= 5)) {
      if (!move || wall.score > (move.score || 0) - 5) return wall;
    }
    // 3) movimento otimo
    if (move) return move;
    if (wall) return wall;
    return null;
  }

  function aiExpertPlay() {
    if (!G || !G.vsIA || G.over) return;
    if (G.turn !== 1) return;
    var dec = aiExpertDecide();
    if (!dec) {
      if (typeof nextTurn === "function") nextTurn();
      return;
    }
    if (dec.type === "move") {
      try {
        if (typeof doMove === "function") doMove(dec.r, dec.c);
        else {
          G.pos[1][0] = dec.r;
          G.pos[1][1] = dec.c;
          if (typeof nextTurn === "function") nextTurn();
        }
      } catch (e) { console.warn(e); }
    } else if (dec.type === "wall") {
      try {
        if (typeof placeWall === "function") placeWall(dec.r, dec.c, dec.ori);
        else {
          tryWall(dec.r, dec.c, dec.ori);
          if (typeof nextTurn === "function") nextTurn();
        }
      } catch (e) { console.warn(e); }
    }
    if (typeof draw === "function") draw();
  }

  // expõe e engancha no nivel expert
  window.aiExpertPlay = aiExpertPlay;
  window.aiExpertDecide = aiExpertDecide;

  // se existir iaPlay / playAI / aiMove, envelopa quando nivel expert
  ["iaPlay", "playAI", "aiMove", "fazerJogadaIA", "aiTurn"].forEach(function (name) {
    if (typeof window[name] === "function") {
      var orig = window[name];
      window[name] = function () {
        if (G && G.vsIA && String(G.nivelIA || "").toLowerCase() === "expert") {
          return aiExpertPlay();
        }
        return orig.apply(this, arguments);
      };
    }
  });

  console.log("IA_EXPERT_INVENCIVEL_V1 carregada");
})();



// ===================== IA_EXPERT_STRATEGIC_V1 =====================
(function () {
    // Função auxiliar para obter o caminho BFS de um jogador (usa bfsDist existente)
    function pathLength(player, pH, pV, pos) {
        return bfsDist(player, pH, pV, pos);
    }

    // Nova avaliação: diferença de caminhos + bônus de ameaça
    function evaluateStrategic(pos, pH, pV, walls) {
        var d0 = pathLength(0, pH, pV, pos); // humano
        var d1 = pathLength(1, pH, pV, pos); // IA
        if (d0 === 0) return -100000;
        if (d1 === 0) return 100000;

        var score = d0 - d1;  // positivo = IA melhor

        // Bônus se oponente está a 1-2 passos da vitória e IA pode alongar
        var threatBonus = 0;
        if (d0 <= 2) {
            threatBonus = 2000 * (3 - d0); // maior se mais perto
        }
        score += threatBonus;

        // Bônus de mobilidade (opcional)
        var mob0 = legalMoves(0, pH, pV, pos).length;
        var mob1 = legalMoves(1, pH, pV, pos).length;
        score += (mob1 - mob0) * 10;

        return score;
    }

    // Gera movimentos legais completos (inclui saltos e diagonais)
    function getAllLegalMoves(player, pH, pV, pos) {
        return legalMoves(player, pH, pV, pos);
    }

    // Verifica se uma parede mantém ambos com caminho
    function wallIsLegal(r, c, ori, pH, pV, walls, pos, player) {
        return canPlaceIA(r, c, ori, pH, pV, walls[player], pos);
    }

    // Verifica se pode ganhar agora
    function canWinNow(player, pH, pV, pos) {
        var moves = getAllLegalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) {
            if (moves[i][0] === WIN[player]) return true;
        }
        return false;
    }

    // Paredes candidatas estratégicas
    function getStrategicWalls(pH, pV, walls, pos, iaIdx) {
        if (walls[iaIdx] <= 0) return [];
        var opp = 1 - iaIdx;
        var currentOppDist = pathLength(opp, pH, pV, pos);
        var cands = [];
        for (var r = 0; r < N - 1; r++) {
            for (var c = 0; c < N - 1; c++) {
                if (wallIsLegal(r, c, 'H', pH, pV, walls, pos, iaIdx)) {
                    var tH = pH.concat([[r, c]]);
                    var newOppDist = pathLength(opp, tH, pV, pos);
                    var selfDist = pathLength(iaIdx, tH, pV, pos);
                    var gain = newOppDist - currentOppDist;
                    var selfPenalty = Math.max(0, selfDist - pathLength(iaIdx, pH, pV, pos));
                    var score = gain * 10 - selfPenalty * 5;
                    cands.push({r: r, c: c, ori: 'H', score: score});
                }
                if (wallIsLegal(r, c, 'V', pH, pV, walls, pos, iaIdx)) {
                    var tV = pV.concat([[r, c]]);
                    var newOppDist = pathLength(opp, pH, tV, pos);
                    var selfDist = pathLength(iaIdx, pH, tV, pos);
                    var gain = newOppDist - currentOppDist;
                    var selfPenalty = Math.max(0, selfDist - pathLength(iaIdx, pH, pV, pos));
                    var score = gain * 10 - selfPenalty * 5;
                    cands.push({r: r, c: c, ori: 'V', score: score});
                }
            }
        }
        cands.sort(function(a, b) { return b.score - a.score; });
        return cands;
    }

    // Minimax com profundidade iterativa e alfa-beta
    function minimaxStrategic(pos, pH, pV, walls, depth, alpha, beta, maximizing, iaIdx, startTime, timeLimit) {
        var key = hashState(pos, pH, pV);
        if (transpositionTable.has(key)) {
            var stored = transpositionTable.get(key);
            if (stored.depth >= depth) return stored.value;
        }
        var d0 = pathLength(0, pH, pV, pos);
        var d1 = pathLength(1, pH, pV, pos);
        if (d1 === 0) return 100000 + depth;
        if (d0 === 0) return -100000 - depth;
        if (depth === 0 || Date.now() - startTime > timeLimit) {
            return evaluateStrategic(pos, pH, pV, walls);
        }

        var cur = maximizing ? iaIdx : 1 - iaIdx;
        var moves = getAllLegalMoves(cur, pH, pV, pos);
        var wCands = getStrategicWalls(pH, pV, walls, pos, cur).slice(0, 20);
        var actions = [];
        for (var i = 0; i < moves.length; i++) {
            actions.push({type: 'move', r: moves[i][0], c: moves[i][1], score: null});
        }
        for (var j = 0; j < wCands.length; j++) {
            actions.push({type: 'wall', r: wCands[j].r, c: wCands[j].c, ori: wCands[j].ori, score: null});
        }
        if (!actions.length) return evaluateStrategic(pos, pH, pV, walls);

        var bestVal = maximizing ? -Infinity : Infinity;
        for (var k = 0; k < actions.length; k++) {
            if (Date.now() - startTime > timeLimit) break;
            var act = actions[k];
            var npos = pos.map(function(p){ return p.slice(); });
            var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
            if (act.type === 'move') {
                npos[cur] = [act.r, act.c];
            } else {
                if (act.ori === 'H') npH = pH.concat([[act.r, act.c]]);
                else npV = pV.concat([[act.r, act.c]]);
                nw[cur]--;
            }
            var newKey = hashState(npos, npH, npV);
            if (isRecentState(newKey)) continue;
            var val = minimaxStrategic(npos, npH, npV, nw, depth - 1, alpha, beta, !maximizing, iaIdx, startTime, timeLimit);
            if (maximizing) {
                if (val > bestVal) bestVal = val;
                alpha = Math.max(alpha, bestVal);
            } else {
                if (val < bestVal) bestVal = val;
                beta = Math.min(beta, bestVal);
            }
            if (beta <= alpha) break;
        }
        transpositionTable.set(key, {value: bestVal, depth: depth});
        return bestVal;
    }

    // Função principal da IA Expert Estratégica
    function iaJogarExpertStrategic() {
        var iaIdx = 1;
        var pos = G.pos.map(function(p){ return p.slice(); });
        var pH = G.pH.slice(), pV = G.pV.slice(), walls = G.walls.slice();
        var startTime = Date.now();
        var timeLimit = 400; // ms, para mobile
        transpositionTable.clear();

        // 1. Verifica vitória imediata
        var winMoves = getAllLegalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) {
            // Escolhe o primeiro e registra histórico
            positionHistory.push(hashState(pos, pH, pV));
            if (positionHistory.length > 8) positionHistory.shift();
            return {type: 'move', r: winMoves[0][0], c: winMoves[0][1]};
        }

        // 2. Bloquear ameaça imediata do oponente (caminho dele == 1)
        var oppDist = pathLength(0, pH, pV, pos); // oponente é índice 0 (humano)
        if (oppDist === 1) {
            var blockingWalls = getStrategicWalls(pH, pV, walls, pos, iaIdx).filter(function(w){
                return w.score > 0;
            });
            if (blockingWalls.length > 0) {
                var best = blockingWalls[0];
                positionHistory.push(hashState(pos, pH, pV));
                if (positionHistory.length > 8) positionHistory.shift();
                return {type: 'wall', r: best.r, c: best.c, ori: best.ori};
            }
        }

        // 3. Se oponente a 2 passos, priorizar paredes fortes
        if (oppDist === 2) {
            var strongWalls = getStrategicWalls(pH, pV, walls, pos, iaIdx).filter(function(w){
                return w.score >= 10; // ganho significativo
            });
            if (strongWalls.length > 0) {
                var best2 = strongWalls[0];
                positionHistory.push(hashState(pos, pH, pV));
                if (positionHistory.length > 8) positionHistory.shift();
                return {type: 'wall', r: best2.r, c: best2.c, ori: best2.ori};
            }
        }

        // 4. Minimax iterativo
        var bestAction = null;
        var bestScore = -Infinity;
        var actionsAll = [];
        var moves = getAllLegalMoves(iaIdx, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) {
            actionsAll.push({type: 'move', r: moves[i][0], c: moves[i][1]});
        }
        var wCands = getStrategicWalls(pH, pV, walls, pos, iaIdx).slice(0, 30);
        for (var j = 0; j < wCands.length; j++) {
            actionsAll.push({type: 'wall', r: wCands[j].r, c: wCands[j].c, ori: wCands[j].ori});
        }

        for (var depth = 1; depth <= 4; depth++) {
            if (Date.now() - startTime > timeLimit) break;
            var localBest = null;
            var localScore = -Infinity;
            var localTop = [];

            for (var k = 0; k < actionsAll.length; k++) {
                if (Date.now() - startTime > timeLimit) break;
                var act = actionsAll[k];
                var npos = pos.map(function(p){ return p.slice(); });
                var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
                if (act.type === 'move') {
                    npos[iaIdx] = [act.r, act.c];
                } else {
                    if (act.ori === 'H') npH = pH.concat([[act.r, act.c]]);
                    else npV = pV.concat([[act.r, act.c]]);
                    nw[iaIdx]--;
                }
                var newKey = hashState(npos, npH, npV);
                if (isRecentState(newKey)) continue;
                var val = minimaxStrategic(npos, npH, npV, nw, depth - 1, -Infinity, Infinity, false, iaIdx, startTime, timeLimit);
                if (val > localScore) {
                    localScore = val;
                    localBest = act;
                    localTop = [{act: act, score: val}];
                } else if (localTop.length < 3 && val > localScore - 100) {
                    localTop.push({act: act, score: val});
                }
            }

            if (localBest) {
                bestAction = localBest;
                bestScore = localScore;
                // guarda top 3 para imprevisibilidade
                window._iaTopActions = localTop;
            }
            if (bestScore > 90000) break;
        }

        // 5. Fallback: avanço no menor caminho
        if (!bestAction) {
            var avancos = moves.filter(function(m){ return m[0] > pos[1][0]; });
            if (avancos.length) {
                avancos.sort(function(a,b){ return a[0] - b[0]; });
                bestAction = {type: 'move', r: avancos[0][0], c: avancos[0][1]};
            } else if (moves.length) {
                bestAction = {type: 'move', r: moves[0][0], c: moves[0][1]};
            }
        }

        // 6. Imprevisibilidade: escolher entre top 3
        if (window._iaTopActions && window._iaTopActions.length > 1) {
            var total = 0;
            for (var i = 0; i < window._iaTopActions.length; i++) {
                total += Math.max(1, window._iaTopActions[i].score + 10000);
            }
            var rand = Math.random() * total;
            for (var i = 0; i < window._iaTopActions.length; i++) {
                rand -= Math.max(1, window._iaTopActions[i].score + 10000);
                if (rand <= 0) {
                    bestAction = window._iaTopActions[i].act;
                    break;
                }
            }
        }

        // Atualiza histórico
        if (bestAction) {
            var finalPos = pos.map(function(p){ return p.slice(); });
            var finalPH = pH.slice(), finalPV = pV.slice();
            if (bestAction.type === 'move') finalPos[iaIdx] = [bestAction.r, bestAction.c];
            else if (bestAction.ori === 'H') finalPH = pH.concat([[bestAction.r, bestAction.c]]);
            else finalPV = pV.concat([[bestAction.r, bestAction.c]]);
            positionHistory.push(hashState(finalPos, finalPH, finalPV));
            if (positionHistory.length > 8) positionHistory.shift();
        }
        return bestAction;
    }

    // Sobrescreve globalmente
    iaJogarExpert = iaJogarExpertStrategic;
    
})();
// ===================== FIM IA_EXPERT_STRATEGIC_V1 =====================





// ===================== FIX_PERFIL_DADOS_V1 =====================
(function () {
    // Garante que window.currentUser e currentUser estejam sincronizados
    function setCurrentUser(name) {
        if (name) {
            currentUser = name;
            window.currentUser = name;
            try {
                localStorage.setItem('quoridor_current_user_name', name);
            } catch (e) {}
        }
    }

    function setUserId(uid) {
        if (uid) {
            window.currentUserId = uid;
            try {
                localStorage.setItem('quoridor_current_user_id', uid);
            } catch (e) {}
        }
    }

    // Sincroniza dados do Firestore para o localStorage e atualiza a UI
    async function syncUserData() {
        try {
            var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
            if (!uid || !currentUser) return;

            var doc = await db.collection('users').doc(uid).get();
            if (doc.exists) {
                var data = doc.data() || {};
                var stats = data.stats || defaultUserStats();
                // Atualiza conta local
                var accounts = getAccounts();
                if (!accounts[currentUser]) accounts[currentUser] = {};
                accounts[currentUser].uid = uid;
                accounts[currentUser].userId = uid;
                accounts[currentUser].username = currentUser;
                accounts[currentUser].stats = stats;
                saveAccounts(accounts);

                // Atualiza elementos da tela de modos
                if (typeof updateRankDisplay === 'function') updateRankDisplay(currentUser);
                if (typeof getStats === 'function') {
                    // Força UI
                    var statsTemp = getStats();
                    var elGames = document.getElementById('stat-games-mode');
                    var elWins = document.getElementById('stat-wins-mode');
                    var elStreak = document.getElementById('stat-streak');
                    if (elGames) elGames.textContent = statsTemp.games;
                    if (elWins) elWins.textContent = statsTemp.wins;
                    if (elStreak) elStreak.textContent = statsTemp.streak || 0;
                }
            }
        } catch (e) {
            console.warn('Erro ao sincronizar dados do perfil:', e);
        }
    }

    // Wrapper de goToModeScreen para chamar sincronização após login
    if (typeof goToModeScreen === 'function') {
        var originalGoToModeScreen = goToModeScreen;
        goToModeScreen = function (username) {
            setCurrentUser(username);
            var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
            setUserId(uid);
            originalGoToModeScreen(username);
            syncUserData();
        };
    } else if (typeof window.goToModeScreen === 'function') {
        var originalGoToModeScreen2 = window.goToModeScreen;
        window.goToModeScreen = function (username) {
            setCurrentUser(username);
            var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
            setUserId(uid);
            originalGoToModeScreen2(username);
            syncUserData();
        };
    }

    // Intercepta loginUser para sincronizar após autenticação
    if (typeof loginUser === 'function') {
        var originalLoginUser = loginUser;
        loginUser = async function (username, password) {
            var ok = await originalLoginUser(username, password);
            if (ok) {
                setCurrentUser(username);
                var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
                setUserId(uid);
                // Aguarda um pouco e sincroniza
                setTimeout(syncUserData, 200);
            }
            return ok;
        };
    }

    // Intercepta createUser
    if (typeof createUser === 'function') {
        var originalCreateUser = createUser;
        createUser = async function (username, password) {
            var ok = await originalCreateUser(username, password);
            if (ok) {
                setCurrentUser(username);
                var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
                setUserId(uid);
                setTimeout(syncUserData, 200);
            }
            return ok;
        };
    }

    // Ao carregar, restaura dados do localStorage e sincroniza
    function restaurarPerfil() {
        try {
            var nome = localStorage.getItem('quoridor_current_user_name');
            var uid = localStorage.getItem('quoridor_current_user_id');
            if (nome) setCurrentUser(nome);
            if (uid) setUserId(uid);
            if (nome && uid) {
                // Sincroniza se estiver na tela de modos
                var modeScreen = document.getElementById('mode-screen');
                if (modeScreen && modeScreen.classList.contains('active')) {
                    syncUserData();
                }
            }
        } catch (e) {}
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', restaurarPerfil);
        window.addEventListener('load', restaurarPerfil);
    } else {
        restaurarPerfil();
    }

    console.log('FIX_PERFIL_DADOS_V1 ATIVO');
})();
// ===================== FIM FIX_PERFIL_DADOS_V1 =====================

// ===================== FIX_SESSAO_SIMPLES =====================
(function () {
    var deviceIdAtual = null;

    function getDeviceId() {
        try {
            var stored = localStorage.getItem('quoridor_device_id');
            if (!stored) {
                stored = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
                localStorage.setItem('quoridor_device_id', stored);
            }
            return stored;
        } catch (e) {
            return 'dev_' + Date.now();
        }
    }

    deviceIdAtual = getDeviceId();

    // Wrapper loginUser
    if (typeof loginUser === 'function') {
        var originalLoginUser = loginUser;
        loginUser = async function (username, password) {
            var ok = await originalLoginUser(username, password);
            if (!ok) return false;

            var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
            if (!uid) return true;

            var sessionRef = db.collection('sessions').doc(uid);
            var snap = await sessionRef.get();
            if (snap.exists) {
                var data = snap.data() || {};
                var lastSeen = Number(data.lastSeen || 0);
                var recent = (Date.now() - lastSeen) < (60 * 60 * 1000);
                if (recent && data.deviceId !== deviceIdAtual) {
                    window.lastAuthError = 'Esta conta já está online em outro dispositivo.';
                    try { await firebase.auth().signOut(); } catch (e) {}
                    currentUser = null;
                    window.currentUserId = null;
                    var el = document.getElementById('login-error');
                    if (el) el.textContent = window.lastAuthError;
                    return false;
                }
            }
            await sessionRef.set({ deviceId: deviceIdAtual, lastSeen: Date.now() }, { merge: true });
            window.currentUserId = uid;
            return true;
        };
    }

    // Wrapper createUser
    if (typeof createUser === 'function') {
        var originalCreateUser = createUser;
        createUser = async function (username, password) {
            var ok = await originalCreateUser(username, password);
            if (ok) {
                var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
                if (uid) {
                    await db.collection('sessions').doc(uid).set({ deviceId: deviceIdAtual, lastSeen: Date.now() }, { merge: true });
                }
            }
            return ok;
        };
    }

    // Wrapper logoutUser
    if (typeof logoutUser === 'function') {
        var originalLogoutUser = logoutUser;
        logoutUser = async function () {
            try {
                var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
                if (uid) {
                    await db.collection('sessions').doc(uid).delete();
                }
            } catch (e) {}
            return await originalLogoutUser.apply(this, arguments);
        };
    }

    console.log('FIX_SESSAO_SIMPLES ATIVO');
})();
// ===================== FIM FIX_SESSAO_SIMPLES =====================

// ===================== FIX_SESSAO_ANTIGAS =====================
(function () {
    function getDeviceId() {
        try {
            var stored = localStorage.getItem('quoridor_device_id');
            if (!stored) {
                stored = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
                localStorage.setItem('quoridor_device_id', stored);
            }
            return stored;
        } catch (e) {
            return 'dev_' + Date.now();
        }
    }

    var deviceIdAtual = getDeviceId();

    // Sobrescreve loginUser para limpar sessões inválidas
    if (typeof loginUser === 'function') {
        var originalLoginUser = loginUser;
        loginUser = async function (username, password) {
            var ok = await originalLoginUser(username, password);
            if (!ok) return false;

            var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
            if (!uid) return true;

            var sessionRef = db.collection('sessions').doc(uid);
            var snap = await sessionRef.get();
            if (snap.exists) {
                var data = snap.data() || {};
                var lastSeen = Number(data.lastSeen);
                var now = Date.now();
                var isValid = !isNaN(lastSeen) && lastSeen > 0 && lastSeen < (now + 60 * 60 * 1000); // não pode ser futuro
                var recent = isValid && (now - lastSeen) < (60 * 60 * 1000);
                var hasDeviceId = typeof data.deviceId === 'string' && data.deviceId.length > 0;

                if (recent && hasDeviceId && data.deviceId !== deviceIdAtual) {
                    window.lastAuthError = 'Esta conta já está online em outro dispositivo.';
                    try { await firebase.auth().signOut(); } catch (e) {}
                    currentUser = null;
                    window.currentUserId = null;
                    var el = document.getElementById('login-error');
                    if (el) el.textContent = window.lastAuthError;
                    return false;
                }

                // Se a sessão é inválida (antiga, zerada, futura), apaga automaticamente
                if (!isValid || !hasDeviceId || lastSeen === 0 || lastSeen > now) {
                    try {
                        await sessionRef.delete();
                    } catch (deleteErr) {
                        console.warn('Não foi possível limpar sessão inválida:', deleteErr);
                    }
                }
            }

            // Cria/atualiza sessão válida
            await sessionRef.set({ deviceId: deviceIdAtual, lastSeen: Date.now() }, { merge: true });
            window.currentUserId = uid;
            return true;
        };
    }

    console.log('FIX_SESSAO_ANTIGAS ATIVO');
})();
// ===================== FIM FIX_SESSAO_ANTIGAS =====================

// ===================== CRIAR_CONTA_LIMPO =====================
async function createUser(username, password) {
    username = String(username || '').trim();
    password = String(password || '');
    window.lastAuthError = '';

    if (username.length < 3) { window.lastAuthError = 'Nickname mínimo 3 caracteres'; return false; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { window.lastAuthError = 'Somente letras, números e _'; return false; }
    if (password.length < 6) { window.lastAuthError = 'Senha mínima 6 caracteres'; return false; }

    var email = usernameToAuthEmail(username);
    var normalizedUsername = username.toLowerCase();

    try {
        var nickSnap = await db.collection('usernames').doc(normalizedUsername).get();
        if (nickSnap.exists) { window.lastAuthError = 'Este nickname já existe'; return false; }

        var credential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        var user = credential.user;
        if (!user || !user.uid) { window.lastAuthError = 'Erro ao obter ID do usuário'; return false; }

        var uid = user.uid;
        var stats = defaultUserStats();

        await db.collection('users').doc(uid).set({
            uid: uid,
            username: username,
            normalizedUsername: normalizedUsername,
            emailAuth: email,
            stats: stats,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('usernames').doc(normalizedUsername).set({
            uid: uid,
            username: username,
            emailAuth: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        var accounts = getAccounts();
        accounts[username] = { uid: uid, userId: uid, username: username, normalizedUsername: normalizedUsername, stats: stats };
        saveAccounts(accounts);

        currentUser = username;
        window.currentUserId = uid;

        return true;
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        if (error.code === 'auth/email-already-in-use') window.lastAuthError = 'Conta já existe. Faça login.';
        else if (error.code === 'auth/weak-password') window.lastAuthError = 'Senha muito fraca.';
        else if (error.code === 'auth/operation-not-allowed') window.lastAuthError = 'Ative Email/Senha no Firebase.';
        else window.lastAuthError = error.message || 'Erro ao criar conta';
        return false;
    }
}
// ===================== FIM CRIAR_CONTA_LIMPO =====================

// ===================== AUTENTICACAO_LIMPA =====================
function getDeviceId() {
    try {
        var stored = localStorage.getItem('quoridor_device_id');
        if (!stored) {
            stored = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('quoridor_device_id', stored);
        }
        return stored;
    } catch (e) {
        return 'dev_' + Date.now();
    }
}

var deviceId = getDeviceId();
var SESSION_TIMEOUT = 60 * 60 * 1000;

async function loginUser(username, password) {
    username = String(username || '').trim();
    password = String(password || '');
    window.lastAuthError = '';
    if (!username || !password) { window.lastAuthError = 'Preencha usuário e senha'; return false; }

    var email = usernameToAuthEmail(username);
    try {
        var credential = await firebase.auth().signInWithEmailAndPassword(email, password);
        var user = credential.user;
        if (!user || !user.uid) throw new Error('Erro ao obter usuário');

        var doc = await db.collection('users').doc(user.uid).get();
        if (!doc.exists) {
            await firebase.auth().signOut();
            window.lastAuthError = 'Perfil não encontrado. Crie uma conta.';
            return false;
        }

        var data = doc.data() || {};
        var displayName = data.username || username;
        var stats = data.stats || defaultUserStats();

        var accounts = getAccounts();
        accounts[displayName] = {
            uid: user.uid,
            userId: user.uid,
            username: displayName,
            normalizedUsername: displayName.toLowerCase(),
            stats: stats
        };
        saveAccounts(accounts);

        currentUser = displayName;
        window.currentUserId = user.uid;
        return true;
    } catch (error) {
        console.error('Erro no login:', error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            window.lastAuthError = 'Usuário ou senha incorretos.';
        } else if (error.code === 'auth/too-many-requests') {
            window.lastAuthError = 'Muitas tentativas. Aguarde alguns minutos.';
        } else {
            window.lastAuthError = error.message || 'Erro ao fazer login';
        }
        return false;
    }
}

async function createUser(username, password) {
    username = String(username || '').trim();
    password = String(password || '');
    window.lastAuthError = '';
    if (username.length < 3) { window.lastAuthError = 'Nickname mínimo 3 caracteres'; return false; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { window.lastAuthError = 'Somente letras, números e _'; return false; }
    if (password.length < 6) { window.lastAuthError = 'Senha mínima 6 caracteres'; return false; }

    var email = usernameToAuthEmail(username);
    var normalizedUsername = username.toLowerCase();

    try {
        var nickSnap = await db.collection('usernames').doc(normalizedUsername).get();
        if (nickSnap.exists) { window.lastAuthError = 'Este nickname já existe'; return false; }

        var credential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        var user = credential.user;
        if (!user || !user.uid) { window.lastAuthError = 'Erro ao obter ID do usuário'; return false; }

        var uid = user.uid;
        var stats = defaultUserStats();

        await db.collection('users').doc(uid).set({
            uid: uid,
            username: username,
            normalizedUsername: normalizedUsername,
            emailAuth: email,
            stats: stats,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('usernames').doc(normalizedUsername).set({
            uid: uid,
            username: username,
            emailAuth: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        var accounts = getAccounts();
        accounts[username] = {
            uid: uid,
            userId: uid,
            username: username,
            normalizedUsername: normalizedUsername,
            stats: stats
        };
        saveAccounts(accounts);

        currentUser = username;
        window.currentUserId = uid;
        return true;
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        if (error.code === 'auth/email-already-in-use') window.lastAuthError = 'Conta já existe. Faça login.';
        else if (error.code === 'auth/weak-password') window.lastAuthError = 'Senha muito fraca.';
        else if (error.code === 'auth/operation-not-allowed') window.lastAuthError = 'Ative Email/Senha no Firebase.';
        else window.lastAuthError = error.message || 'Erro ao criar conta';
        return false;
    }
}

async function logoutUser() {
    try {
        if (firebase.auth().currentUser) {
            await firebase.auth().signOut();
        }
    } catch (e) {}
    currentUser = null;
    window.currentUserId = null;
    try {
        localStorage.removeItem('quoridor_current_user_id');
        localStorage.removeItem('quoridor_current_user_name');
    } catch (e) {}
    var po = document.getElementById('profile-overlay');
    if (po) po.classList.remove('show');
    if (typeof setLoginUI === 'function') setLoginUI(true);
    if (typeof showScreen === 'function') showScreen('login-screen');
}
// ===================== FIM AUTENTICACAO_LIMPA =====================

// ===================== LOGIN_REDIRECIONAR =====================
(function () {
    // Intercepta formulário de login
    function wireLoginRedirecionar() {
        var form = document.getElementById('login-form');
        if (!form || form.dataset.redirWired === '1') return;
        form.dataset.redirWired = '1';

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            var username = String((document.getElementById('login-username') || {}).value || '').trim();
            var password = String((document.getElementById('login-password') || {}).value || '');
            var err = document.getElementById('login-error');
            var btn = document.getElementById('login-btn');
            var isLogin = btn ? /ENTRAR/i.test(btn.textContent || '') : true;

            if (!username || !password) {
                if (err) err.textContent = 'Preencha todos os campos';
                return;
            }

            // Se estiver no modo login
            if (isLogin) {
                if (err) err.textContent = 'Verificando conta...';
                try {
                    // Verifica se o usuário existe no Firestore
                    var normalized = username.toLowerCase();
                    var nickDoc = await db.collection('usernames').doc(normalized).get();
                    if (!nickDoc.exists) {
                        if (err) err.textContent = 'Esta conta não existe.';
                        // Altera para modo cadastro automaticamente
                        if (typeof setLoginUI === 'function') setLoginUI(false);
                        // Preenche o nome de usuário no campo
                        var usernameInput = document.getElementById('login-username');
                        if (usernameInput) usernameInput.value = username;
                        // Foco no campo de senha
                        var passInput = document.getElementById('login-password');
                        if (passInput) passInput.focus();
                        // Mensagem amigável
                        setTimeout(function () {
                            if (err) err.textContent = 'Crie sua conta para continuar.';
                        }, 1500);
                        return;
                    }

                    // Se existe, tenta login
                    if (typeof loginUser === 'function') {
                        var ok = await loginUser(username, password);
                        if (ok) {
                            if (err) err.textContent = '';
                            if (typeof goToModeScreen === 'function') goToModeScreen(username);
                        } else {
                            if (err) err.textContent = window.lastAuthError || 'Usuário ou senha inválidos';
                        }
                    }
                } catch (ex) {
                    if (err) err.textContent = 'Erro: ' + (ex.message || ex);
                }
            }
            // Se estiver no modo cadastro, apenas deixa o fluxo normal
        }, true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireLoginRedirecionar);
        window.addEventListener('load', wireLoginRedirecionar);
    } else {
        wireLoginRedirecionar();
    }
})();
// ===================== FIM LOGIN_REDIRECIONAR =====================

// ===================== CADASTRO_AUTO_LOGIN =====================
(function () {
    function instalarFormulario() {
        var form = document.getElementById('login-form');
        if (!form || form.dataset.cadastroWired === '1') return;
        form.dataset.cadastroWired = '1';

        // Clona para remover listeners antigos
        var novoForm = form.cloneNode(true);
        form.parentNode.replaceChild(novoForm, form);

        novoForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            var username = String((document.getElementById('login-username') || {}).value || '').trim();
            var password = String((document.getElementById('login-password') || {}).value || '');
            var confirm = String((document.getElementById('login-confirm') || {}).value || '');
            var err = document.getElementById('login-error');
            var btn = document.getElementById('login-btn');
            var isLogin = btn ? /ENTRAR/i.test(btn.textContent || '') : true;

            if (!username || !password) {
                if (err) err.textContent = 'Preencha todos os campos';
                return;
            }

            if (isLogin) {
                // Modo login
                if (err) err.textContent = 'Verificando conta...';
                try {
                    var normalized = username.toLowerCase();
                    var nickDoc = await db.collection('usernames').doc(normalized).get();
                    if (!nickDoc.exists) {
                        if (err) err.textContent = 'Esta conta não existe.';
                        if (typeof setLoginUI === 'function') setLoginUI(false);
                        var usernameInput = document.getElementById('login-username');
                        if (usernameInput) usernameInput.value = username;
                        var passInput = document.getElementById('login-password');
                        if (passInput) passInput.focus();
                        setTimeout(function () { if (err) err.textContent = 'Crie sua conta para continuar.'; }, 1500);
                        return;
                    }
                    var okLogin = typeof loginUser === 'function' && await loginUser(username, password);
                    if (okLogin) {
                        if (err) err.textContent = '';
                        if (typeof goToModeScreen === 'function') goToModeScreen(username);
                    } else {
                        if (err) err.textContent = window.lastAuthError || 'Usuário ou senha inválidos';
                    }
                } catch (ex) {
                    if (err) err.textContent = 'Erro: ' + (ex.message || ex);
                }
            } else {
                // Modo cadastro
                if (password.length < 6) { if (err) err.textContent = 'Senha mínima 6 caracteres'; return; }
                if (confirm && password !== confirm) { if (err) err.textContent = 'As senhas não coincidem'; return; }
                if (err) err.textContent = 'Criando conta...';
                var okCreate = typeof createUser === 'function' && await createUser(username, password);
                if (okCreate) {
                    if (err) err.textContent = '';
                    if (typeof goToModeScreen === 'function') goToModeScreen(username);
                } else {
                    if (err) err.textContent = window.lastAuthError || 'Erro ao criar conta';
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', instalarFormulario);
        window.addEventListener('load', instalarFormulario);
    } else {
        instalarFormulario();
    }
})();
// ===================== FIM CADASTRO_AUTO_LOGIN =====================

// ===================== SESSAO_UNICA_V2 =====================
(function () {
    // Garante que getDeviceId exista
    if (typeof getDeviceId !== 'function') {
        window.getDeviceId = function () {
            try {
                var stored = localStorage.getItem('quoridor_device_id');
                if (!stored) {
                    stored = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
                    localStorage.setItem('quoridor_device_id', stored);
                }
                return stored;
            } catch (e) {
                return 'dev_' + Date.now();
            }
        };
    }

    var deviceIdAtual = getDeviceId();
    var SESSION_TIMEOUT = 60 * 60 * 1000; // 60 minutos

    // Wrapper loginUser
    if (typeof loginUser === 'function') {
        var originalLoginUser = loginUser;
        loginUser = async function (username, password) {
            var ok = await originalLoginUser(username, password);
            if (!ok) return false;

            var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
            if (!uid) return true; // sem UID, não gerencia sessão

            var sessionRef = db.collection('sessions').doc(uid);
            var snap = await sessionRef.get();
            if (snap.exists) {
                var data = snap.data() || {};
                var lastSeen = Number(data.lastSeen) || 0;
                var recent = (Date.now() - lastSeen) < SESSION_TIMEOUT;
                if (recent && data.deviceId && data.deviceId !== deviceIdAtual) {
                    window.lastAuthError = 'Esta conta já está online em outro dispositivo.';
                    try { await firebase.auth().signOut(); } catch (e) {}
                    currentUser = null;
                    window.currentUserId = null;
                    var el = document.getElementById('login-error');
                    if (el) el.textContent = window.lastAuthError;
                    return false;
                }
            }

            // Atualiza sessão com este dispositivo
            await sessionRef.set({ deviceId: deviceIdAtual, lastSeen: Date.now() }, { merge: true });
            return true;
        };
    }

    // Wrapper createUser
    if (typeof createUser === 'function') {
        var originalCreateUser = createUser;
        createUser = async function (username, password) {
            var ok = await originalCreateUser(username, password);
            if (ok) {
                var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
                if (uid) {
                    await db.collection('sessions').doc(uid).set({ deviceId: deviceIdAtual, lastSeen: Date.now() }, { merge: true });
                }
            }
            return ok;
        };
    }

    // Wrapper logoutUser
    if (typeof logoutUser === 'function') {
        var originalLogoutUser = logoutUser;
        logoutUser = async function () {
            try {
                var uid = window.currentUserId || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
                if (uid) await db.collection('sessions').doc(uid).delete();
            } catch (e) {}
            return await originalLogoutUser.apply(this, arguments);
        };
    }

    // Mantém sessão viva enquanto logado
    setInterval(function () {
        if (window.currentUserId && firebase.auth().currentUser) {
            db.collection('sessions').doc(window.currentUserId).set({
                deviceId: deviceIdAtual,
                lastSeen: Date.now()
            }, { merge: true }).catch(function () {});
        }
    }, 30000);

    console.log('SESSAO_UNICA_V2 ATIVO');
})();
// ===================== FIM SESSAO_UNICA_V2 =====================

// ===================== TITULOS_DEDUP =====================
(function () {
    // Corrige duplicatas dentro de TITLES
    if (typeof TITLES !== 'undefined') {
        TITLES = TITLES.map(function (t) {
            if (t.title === 'O Supremo' && t.minWins === 3600) {
                t.title = 'O Supremo II';
            }
            return t;
        });
    }

    // Corrige duplicata entre TITLES e SEQUENCE_TITLES
    if (typeof SEQUENCE_TITLES !== 'undefined') {
        SEQUENCE_TITLES = SEQUENCE_TITLES.map(function (t) {
            if (t.title === 'O Imortal' && t.minStreak === 10000) {
                t.title = 'O Imortal da Sequência';
            }
            return t;
        });
    }

    // Se necessário, renomeia também "O Imortal" em TITLES (minWins 2000) para evitar conflito visual
    if (typeof TITLES !== 'undefined') {
        TITLES = TITLES.map(function (t) {
            if (t.title === 'O Imortal' && t.minWins === 2000) {
                t.title = 'O Imortal das Vitórias';
            }
            return t;
        });
    }

    console.log('TITULOS_DEDUP ATIVO');
})();
// ===================== FIM TITULOS_DEDUP =====================

// ===================== TITULOS_ATUALIZADOS_V2 =====================
(function () {
    // ===== Deduplicação e renomeação de títulos =====
    if (typeof TITLES !== 'undefined') {
        var vistos = {};
        TITLES = TITLES.map(function (t) {
            if (t.title === 'O Supremo' && t.minWins === 3600) t.title = 'O Supremo II';
            if (t.title === 'O Imortal' && t.minWins === 2000) t.title = 'O Imortal das Vitórias';
            if (vistos[t.title]) {
                // Se repetir, adiciona sufixo com base no requisito
                t.title = t.title + ' II';
            }
            vistos[t.title] = true;
            return t;
        });
    }

    if (typeof SEQUENCE_TITLES !== 'undefined') {
        var vistosSeq = {};
        SEQUENCE_TITLES = SEQUENCE_TITLES.map(function (t) {
            if (t.title === 'O Imortal' && t.minStreak === 10000) t.title = 'O Imortal da Sequência';
            if (vistosSeq[t.title]) {
                t.title = t.title + ' II';
            }
            vistosSeq[t.title] = true;
            return t;
        });
    }

    // ===== Função de requisito =====
    function getRequirementLabel(key, threshold) {
        switch (key) {
            case 'wins': return 'Vitórias: ' + threshold;
            case 'maxStreak': return 'Sequência de vitórias: ' + threshold;
            case 'games': return 'Partidas jogadas: ' + threshold;
            case 'level': return 'Nível: ' + threshold;
            case 'localGames': return 'Partidas locais: ' + threshold;
            case 'expertWins': return 'Vitórias vs IA Expert: ' + threshold;
            default: return 'Requer: ' + threshold;
        }
    }

    // ===== Nova renderTitleList com requisitos =====
    window.renderTitleList = function (listElement, arr, key, iconUnlocked, iconLocked, reqPrefix) {
        var stats = getUserStats(currentUser);
        var val = 0;
        if (key === 'wins') val = stats.wins || 0;
        else if (key === 'maxStreak') val = stats.maxStreak || 0;
        else if (key === 'games') val = stats.games || 0;
        else if (key === 'level') val = stats.level || 1;
        else if (key === 'localGames') val = stats.localGames || 0;
        else if (key === 'expertWins') val = stats.expertWins || 0;
        var equipped = stats.equippedTitle || 'Recruta';
        listElement.innerHTML = '';

        if (key === 'wins') {
            var recrutaItem = document.createElement('div');
            recrutaItem.className = 'title-item unlocked';
            recrutaItem.innerHTML = '<span class="title-icon">👶</span><div class="title-info"><div class="title-name">Recruta</div><div class="title-req">Título inicial.</div></div>' + (equipped === 'Recruta' ? '<button class="title-equip-btn equipped" disabled>✓ Em uso</button>' : '<button class="title-equip-btn" data-title="Recruta">Usar</button>');
            listElement.appendChild(recrutaItem);
        }

        for (var i = 0; i < arr.length; i++) {
            var t = arr[i];
            if (!matchesQuery(t.title)) continue;
            var threshold = t.minWins || t.minStreak || t.minGames || t.level || t.minLocalGames || t.minVsIAWins || 0;
            var unlocked = val >= threshold;
            var reqText = getRequirementLabel(key, threshold);
            var item = document.createElement('div');
            item.className = 'title-item' + (unlocked ? ' unlocked' : ' locked');
            item.innerHTML = '<span class="title-icon">' + (unlocked ? iconUnlocked : '🔒') + '</span>' +
                '<div class="title-info"><div class="title-name">' + t.title + '</div><div class="title-req">' + reqText + '</div></div>' +
                (unlocked ? (equipped === t.title ? '<button class="title-equip-btn equipped" disabled>✓ Em uso</button>' : '<button class="title-equip-btn" data-title="' + t.title + '">Usar</button>') : '<span class="title-status">🔒</span>');
            listElement.appendChild(item);
        }
        var buttons = listElement.querySelectorAll('.title-equip-btn[data-title]');
        for (var j = 0; j < buttons.length; j++) {
            buttons[j].addEventListener('click', function (e) {
                e.stopPropagation();
                equipTitle(this.getAttribute('data-title'));
            });
        }
    };

    // ===== Busca global =====
    window.renderSearchResults = function (list) {
        var query = titleSearchQuery;
        var all = [];
        TITLES.forEach(function (t) { all.push({ title: t.title, threshold: t.minWins, key: 'wins' }); });
        SEQUENCE_TITLES.forEach(function (t) { all.push({ title: t.title, threshold: t.minStreak, key: 'maxStreak' }); });
        GAMES_PLAYED_TITLES.forEach(function (t) { all.push({ title: t.title, threshold: t.minGames, key: 'games' }); });
        LEVEL_TITLES.forEach(function (t) { all.push({ title: t.title, threshold: t.level, key: 'level' }); });
        LOCAL_GAMES_TITLES.forEach(function (t) { all.push({ title: t.title, threshold: t.minLocalGames, key: 'localGames' }); });
        IA_WINS_TITLES.forEach(function (t) { all.push({ title: t.title, threshold: t.minVsIAWins, key: 'expertWins' }); });

        var filtered = all.filter(function (item) { return item.title.toLowerCase().includes(query); });
        list.innerHTML = '';
        if (filtered.length === 0) {
            list.innerHTML = '<div class="history-empty" style="color:#b8a99a;padding:30px 0;text-align:center;">Nenhum título encontrado.</div>';
            return;
        }
        var stats = getUserStats(currentUser);
        for (var i = 0; i < filtered.length; i++) {
            var item = filtered[i];
            var val = 0;
            switch (item.key) {
                case 'wins': val = stats.wins || 0; break;
                case 'maxStreak': val = stats.maxStreak || 0; break;
                case 'games': val = stats.games || 0; break;
                case 'level': val = stats.level || 1; break;
                case 'localGames': val = stats.localGames || 0; break;
                case 'expertWins': val = stats.expertWins || 0; break;
            }
            var unlocked = val >= item.threshold;
            var reqText = getRequirementLabel(item.key, item.threshold);
            var div = document.createElement('div');
            div.className = 'title-item' + (unlocked ? ' unlocked' : ' locked');
            div.innerHTML = '<span class="title-icon">' + (unlocked ? '🏆' : '🔒') + '</span><div class="title-info"><div class="title-name">' + item.title + '</div><div class="title-req">' + reqText + '</div></div>' + (unlocked ? (getStats().equippedTitle === item.title ? '<button class="title-equip-btn equipped" disabled>✓ Em uso</button>' : '<button class="title-equip-btn" data-title="' + item.title + '">Usar</button>') : '<span class="title-status">🔒</span>');
            list.appendChild(div);
        }
        var buttons = list.querySelectorAll('.title-equip-btn[data-title]');
        for (var j = 0; j < buttons.length; j++) {
            buttons[j].addEventListener('click', function (e) {
                e.stopPropagation();
                equipTitle(this.getAttribute('data-title'));
            });
        }
    };

    // ===== renderCurrentTitlesTab com busca =====
    window.renderCurrentTitlesTab = function () {
        var list = document.getElementById('titles-list');
        if (titleSearchQuery) {
            renderSearchResults(list);
            return;
        }
        if (currentTitlesTab === 'vitorias') renderTitleList(list, TITLES, 'wins', '🏆', '🔒', 'Vitórias');
        else if (currentTitlesTab === 'sequencia') renderTitleList(list, SEQUENCE_TITLES, 'maxStreak', '🔥', '🔒', 'Sequência');
        else if (currentTitlesTab === 'partidas') renderTitleList(list, GAMES_PLAYED_TITLES, 'games', '🎮', '🔒', 'Partidas');
        else if (currentTitlesTab === 'nivel') renderTitleList(list, LEVEL_TITLES, 'level', '⭐', '🔒', 'Nível');
        else if (currentTitlesTab === '2p') renderTitleList(list, LOCAL_GAMES_TITLES, 'localGames', '👥', '🔒', 'Partidas locais');
        else if (currentTitlesTab === 'vsia') renderTitleList(list, IA_WINS_TITLES, 'expertWins', '🤖', '🔒', 'Vitórias vs IA Expert');
        else list.innerHTML = '<div class="history-empty" style="color:#b8a99a;padding:30px 0;text-align:center;">Em breve</div>';
    };

    console.log('TITULOS_ATUALIZADOS_V2 ATIVO');
})();
// ===================== FIM TITULOS_ATUALIZADOS_V2 =====================

// ===================== OCULTAR_NUMERO_SKIN =====================
(function () {
    function getEquippedSkinId() {
        try {
            if (!currentUser) return 'classic';
            var stats = (typeof getStats === 'function') ? getStats() : null;
            if (stats && stats.equippedSkin) return stats.equippedSkin;
            if (window.currentUser && window.currentUser.stats && window.currentUser.stats.equippedSkin) {
                return window.currentUser.stats.equippedSkin;
            }
            return 'classic';
        } catch (e) {
            return 'classic';
        }
    }

    // Wrapper sobre drawPawn: suprime o número quando skin não clássica
    if (typeof drawPawn === 'function') {
        var _originalDrawPawn = drawPawn;

        drawPawn = function (p, x, y, rad, active, rotateText) {
            var skinId = getEquippedSkinId();
            var ocultar = (skinId && skinId !== 'classic');

            if (!ocultar) {
                return _originalDrawPawn.apply(this, arguments);
            }

            // Suprime fillText do número (1 ou 2) durante o desenho do peão
            var ctx = canvas.getContext('2d');
            var originalFillText = ctx.fillText;
            var numeroStr = String(p + 1);

            ctx.fillText = function (text, tx, ty) {
                if (typeof text === 'string' && text === numeroStr) {
                    return; // ignora o número do peão
                }
                return originalFillText.apply(this, arguments);
            };

            try {
                _originalDrawPawn.apply(this, arguments);
            } finally {
                ctx.fillText = originalFillText;
            }
        };
    }

    console.log('OCULTAR_NUMERO_SKIN ATIVO');
})();
// ===================== FIM OCULTAR_NUMERO_SKIN =====================

// ===================== IA_EXPERT_ECONOMICA =====================
(function () {
    var WIN = [0, 8];
    var ultimasPosicoes = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return ultimasPosicoes.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        ultimasPosicoes.push(posKey(r, c));
        if (ultimasPosicoes.length > 6) ultimasPosicoes.shift();
    }

    // Funções auxiliares locais (não dependem de funções antigas)
    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsDist(player, pH, pV, pos) {
        var goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (seen[key]) continue;
                seen[key] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function canPlaceIA(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r > 7 || c < 0 || c > 7) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
            for (var i = 0; i < pV.length; i++) if (pV[i][0] === r && pV[i][1] === c) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) if (pV[i][0] === r && pV[i][1] === c) return false;
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        var iaIdx = 1;
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];

        // 1. Vitória imediata
        var winMoves = legalMoves(1, pH, pV, pos).filter(function(m){ return m[0] === WIN[1]; });
        if (winMoves.length > 0) {
            registrar(winMoves[0][0], winMoves[0][1]);
            return { type: 'move', r: winMoves[0][0], c: winMoves[0][1] };
        }

        // 2. Bloqueio obrigatório: oponente a 1 da vitória
        var oppDist = bfsDist(0, pH, pV, pos);
        if (canWinNext(0, pH, pV, pos) || oppDist === 1) {
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (canPlaceIA(r, c, 'H', pH, pV, walls[1], pos) && !canWinNext(0, pH.concat([[r, c]]), pV, pos)) {
                    return { type: 'wall', r: r, c: c, ori: 'H' };
                }
                if (canPlaceIA(r, c, 'V', pH, pV, walls[1], pos) && !canWinNext(0, pH, pV.concat([[r, c]]), pos)) {
                    return { type: 'wall', r: r, c: c, ori: 'V' };
                }
            }
        }

        // 3. Prioridade: avançar pelo caminho mais curto (sem recuar, sem repetir)
        var moves = legalMoves(1, pH, pV, pos);
        var avancos = moves.filter(function(m){ return m[0] > pos[1][0]; });
        var laterais = moves.filter(function(m){ return m[0] === pos[1][0]; });

        // Filtra repetidos
        var avancosUnicos = avancos.filter(function(m){ return !jaVisitou(m[0], m[1]); });
        var lateraisUnicas = laterais.filter(function(m){ return !jaVisitou(m[0], m[1]); });
        if (avancosUnicos.length === 0) avancosUnicos = avancos;
        if (lateraisUnicas.length === 0) lateraisUnicas = laterais;

        // Ordena avanços por menor distância BFS
        function ordenarPorDist(lista) {
            lista.sort(function(a, b) {
                var da = bfsDist(1, pH, pV, [[a[0], a[1]], pos[1]]);
                var db = bfsDist(1, pH, pV, [[b[0], b[1]], pos[1]]);
                return da - db;
            });
        }
        ordenarPorDist(avancosUnicos);
        ordenarPorDist(lateraisUnicas);

        // Se houver avanço, usa imediatamente (economia de paredes)
        if (avancosUnicos.length > 0) {
            var m = avancosUnicos[0];
            registrar(m[0], m[1]);
            return { type: 'move', r: m[0], c: m[1] };
        }

        // Se houver lateral que encurta ou mantém, usa
        if (lateraisUnicas.length > 0) {
            var l = lateraisUnicas[0];
            registrar(l[0], l[1]);
            return { type: 'move', r: l[0], c: l[1] };
        }

        // 4. Se não houver movimento (raro), tenta parede curta para desbloquear
        var meuDist = bfsDist(1, pH, pV, pos);
        if (meuDist >= 99) {
            // tenta remover bloqueio do próprio caminho? Regras não permitem remover paredes.
            // então só avança qualquer movimento legal
            if (moves.length > 0) {
                registrar(moves[0][0], moves[0][1]);
                return { type: 'move', r: moves[0][0], c: moves[0][1] };
            }
        }

        // 5. Economia: só coloca parede se oponente estiver perto (dist <= 2)
        // e se a parede atrasar significativamente sem prejudicar a própria IA
        if (oppDist <= 2 && walls[1] > 0) {
            var melhores = [];
            for (var rw = 0; rw < 8; rw++) for (var cw = 0; cw < 8; cw++) {
                if (canPlaceIA(rw, cw, 'H', pH, pV, walls[1], pos)) {
                    var tH = pH.concat([[rw, cw]]);
                    var novoOpp = bfsDist(0, tH, pV, pos);
                    var novoMeu = bfsDist(1, tH, pV, pos);
                    if (novoOpp > oppDist && novoMeu <= meuDist) {
                        melhores.push({ r: rw, c: cw, ori: 'H', score: (novoOpp - oppDist) * 10 - Math.max(0, novoMeu - meuDist) * 5 });
                    }
                }
                if (canPlaceIA(rw, cw, 'V', pH, pV, walls[1], pos)) {
                    var tV = pV.concat([[rw, cw]]);
                    var novoOppV = bfsDist(0, pH, tV, pos);
                    var novoMeuV = bfsDist(1, pH, tV, pos);
                    if (novoOppV > oppDist && novoMeuV <= meuDist) {
                        melhores.push({ r: rw, c: cw, ori: 'V', score: (novoOppV - oppDist) * 10 - Math.max(0, novoMeuV - meuDist) * 5 });
                    }
                }
            }
            if (melhores.length > 0) {
                melhores.sort(function(a, b){ return b.score - a.score; });
                return { type: 'wall', r: melhores[0].r, c: melhores[0].c, ori: melhores[0].ori };
            }
        }

        // 6. Fallback: qualquer movimento
        if (moves.length > 0) {
            registrar(moves[0][0], moves[0][1]);
            return { type: 'move', r: moves[0][0], c: moves[0][1] };
        }

        return null;
    }

    // Substitui a IA Expert global
    
    
    

    console.log('IA_EXPERT_ECONOMICA ATIVO');
})();
// ===================== FIM IA_EXPERT_ECONOMICA =====================

// ===================== IA_EXPERT_FINAL_ESTAVEL =====================
(function () {
    var WIN = [0, 8];
    var ultimasPosicoes = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return ultimasPosicoes.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        ultimasPosicoes.push(posKey(r, c));
        if (ultimasPosicoes.length > 4) ultimasPosicoes.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsDist(player, pH, pV, pos) {
        var goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (seen[key]) continue;
                seen[key] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function paredeJaExiste(r, c, ori, pH, pV) {
        if (ori === 'H') return pH.some(function(w){ return w[0] === r && w[1] === c; });
        return pV.some(function(w){ return w[0] === r && w[1] === c; });
    }

    function canPlaceIA(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r > 7 || c < 0 || c > 7) return false;
        // Verifica sobreposição explícita
        if (paredeJaExiste(r, c, ori, pH, pV)) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
            for (var i = 0; i < pV.length; i++) if (pV[i][0] === r && pV[i][1] === c) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) if (pV[i][0] === r && pV[i][1] === c) return false;
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];

        // 1. Vitória imediata
        var winMoves = legalMoves(1, pH, pV, pos).filter(function(m){ return m[0] === WIN[1]; });
        if (winMoves.length > 0) {
            registrar(winMoves[0][0], winMoves[0][1]);
            return { type: 'move', r: winMoves[0][0], c: winMoves[0][1] };
        }

        // 2. Bloquear ameaça imediata (oponente a 1)
        var oppDist = bfsDist(0, pH, pV, pos);
        if (canWinNext(0, pH, pV, pos) || oppDist === 1) {
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (canPlaceIA(r, c, 'H', pH, pV, walls[1], pos) && !canWinNext(0, pH.concat([[r, c]]), pV, pos)) {
                    return { type: 'wall', r: r, c: c, ori: 'H' };
                }
                if (canPlaceIA(r, c, 'V', pH, pV, walls[1], pos) && !canWinNext(0, pH, pV.concat([[r, c]]), pos)) {
                    return { type: 'wall', r: r, c: c, ori: 'V' };
                }
            }
        }

        // 3. Movimento por BFS: sempre escolhe o passo que MAIS reduz a distância.
        //    Se nenhum reduz, escolhe o que aumenta menos (contorno natural).
        var meuDist = bfsDist(1, pH, pV, pos);
        var moves = legalMoves(1, pH, pV, pos);

        var melhorMov = null;
        var melhorDist = meuDist;
        var melhorDelta = 999;
        for (var i = 0; i < moves.length; i++) {
            var m = moves[i];
            var npos = [pos[0].slice(), pos[1].slice()];
            npos[1] = [m[0], m[1]];
            var d = bfsDist(1, pH, pV, npos);
            var delta = d - meuDist;
            var repetido = jaVisitou(m[0], m[1]);

            // Prioridade: não repetido + menor distância
            var score = -d * 10 - (repetido ? 50 : 0) - Math.abs(delta) * 0.1;
            if (melhorMov === null || score > melhorDelta) {
                melhorMov = { type: 'move', r: m[0], c: m[1] };
                melhorDist = d;
                melhorDelta = score;
            }
        }

        // Se o melhor movimento reduz a distância, faça-o imediatamente.
        if (melhorMov && melhorDist < meuDist) {
            registrar(melhorMov.r, melhorMov.c);
            return melhorMov;
        }

        // 4. Economia de paredes: só usa parede se oponente próximo E parede realmente atrasa
        if (oppDist <= 2 && walls[1] > 0) {
            var melhores = [];
            for (var rw = 0; rw < 8; rw++) for (var cw = 0; cw < 8; cw++) {
                if (canPlaceIA(rw, cw, 'H', pH, pV, walls[1], pos)) {
                    var tH = pH.concat([[rw, cw]]);
                    var novoOppH = bfsDist(0, tH, pV, pos);
                    var novoMeuH = bfsDist(1, tH, pV, pos);
                    if (novoOppH > oppDist && novoMeuH <= meuDist) {
                        melhores.push({ r: rw, c: cw, ori: 'H', score: (novoOppH - oppDist) * 12 - Math.max(0, novoMeuH - meuDist) * 6 });
                    }
                }
                if (canPlaceIA(rw, cw, 'V', pH, pV, walls[1], pos)) {
                    var tV = pV.concat([[rw, cw]]);
                    var novoOppV = bfsDist(0, pH, tV, pos);
                    var novoMeuV = bfsDist(1, pH, tV, pos);
                    if (novoOppV > oppDist && novoMeuV <= meuDist) {
                        melhores.push({ r: rw, c: cw, ori: 'V', score: (novoOppV - oppDist) * 12 - Math.max(0, novoMeuV - meuDist) * 6 });
                    }
                }
            }
            if (melhores.length > 0) {
                melhores.sort(function(a, b){ return b.score - a.score; });
                var best = melhores[0];
                // Dupla checagem antes de retornar
                if (!paredeJaExiste(best.r, best.c, best.ori, pH, pV)) {
                    return { type: 'wall', r: best.r, c: best.c, ori: best.ori };
                }
            }
        }

        // 5. Fallback: movimento que menos aumenta a distância (contorno)
        if (melhorMov) {
            registrar(melhorMov.r, melhorMov.c);
            return melhorMov;
        }

        return null;
    }

    window.iaJogarExpert = iaJogarExpert;
    console.log('IA_EXPERT_FINAL_ESTAVEL ATIVO');
})();
// ===================== FIM IA_EXPERT_FINAL_ESTAVEL =====================

// ===================== IA_EXPERT_JUSTA =====================
(function () {
    var WIN = [0, 8];
    var ultimasPosicoes = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return ultimasPosicoes.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        ultimasPosicoes.push(posKey(r, c));
        if (ultimasPosicoes.length > 6) ultimasPosicoes.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsDist(player, pH, pV, pos) {
        var goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (seen[key]) continue;
                seen[key] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    // Mesma lógica do canPlace do player (mas com estado local)
    function canPlaceInternal(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) if (pV[i][0] === r && pV[i][1] === c) return false;
        for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];

        // 1. Vitória imediata
        var winMoves = legalMoves(1, pH, pV, pos).filter(function(m){ return m[0] === WIN[1]; });
        if (winMoves.length > 0) {
            registrar(winMoves[0][0], winMoves[0][1]);
            return { type: 'move', r: winMoves[0][0], c: winMoves[0][1] };
        }

        // 2. Bloqueio de ameaça imediata
        var oppDist = bfsDist(0, pH, pV, pos);
        if (canWinNext(0, pH, pV, pos) || oppDist === 1) {
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (canPlaceInternal(r, c, 'H', pH, pV, walls[1], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(0, tH, pV, pos)) return { type: 'wall', r: r, c: c, ori: 'H' };
                }
                if (canPlaceInternal(r, c, 'V', pH, pV, walls[1], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(0, pH, tV, pos)) return { type: 'wall', r: r, c: c, ori: 'V' };
                }
            }
        }

        // 3. Avanço pelo caminho mais curto (prioridade máxima)
        var meuDist = bfsDist(1, pH, pV, pos);
        var moves = legalMoves(1, pH, pV, pos);
        var melhorMov = null, melhorDist = meuDist, melhorScore = -1e15;
        for (var i = 0; i < moves.length; i++) {
            var m = moves[i];
            var npos = [pos[0].slice(), pos[1].slice()];
            npos[1] = [m[0], m[1]];
            var d = bfsDist(1, pH, pV, npos);
            var repetido = jaVisitou(m[0], m[1]);
            var score = -d * 10 - (repetido ? 100 : 0);
            if (score > melhorScore) {
                melhorScore = score;
                melhorDist = d;
                melhorMov = { type: 'move', r: m[0], c: m[1] };
            }
        }

        if (melhorMov && melhorDist < meuDist) {
            registrar(melhorMov.r, melhorMov.c);
            return melhorMov;
        }

        // 4. Bloqueio leve quando oponente passa do meio (linha <= 4)
        var oppRow = pos[0][0];
        if (oppRow <= 4 && walls[1] > 0) {
            var melhores = [];
            for (var rw = 0; rw < 8; rw++) for (var cw = 0; cw < 8; cw++) {
                if (canPlaceInternal(rw, cw, 'H', pH, pV, walls[1], pos)) {
                    var tH2 = pH.concat([[rw, cw]]);
                    var novoOpp = bfsDist(0, tH2, pV, pos);
                    var novoMeu = bfsDist(1, tH2, pV, pos);
                    if (novoOpp > oppDist && novoMeu <= meuDist) {
                        melhores.push({ r: rw, c: cw, ori: 'H', score: (novoOpp - oppDist) * 10 - Math.max(0, novoMeu - meuDist) * 5 });
                    }
                }
                if (canPlaceInternal(rw, cw, 'V', pH, pV, walls[1], pos)) {
                    var tV2 = pV.concat([[rw, cw]]);
                    var novoOppV = bfsDist(0, pH, tV2, pos);
                    var novoMeuV = bfsDist(1, pH, tV2, pos);
                    if (novoOppV > oppDist && novoMeuV <= meuDist) {
                        melhores.push({ r: rw, c: cw, ori: 'V', score: (novoOppV - oppDist) * 10 - Math.max(0, novoMeuV - meuDist) * 5 });
                    }
                }
            }
            if (melhores.length > 0) {
                melhores.sort(function(a, b){ return b.score - a.score; });
                var best = melhores[0];
                if (canPlaceInternal(best.r, best.c, best.ori, pH, pV, walls[1], pos)) {
                    return { type: 'wall', r: best.r, c: best.c, ori: best.ori };
                }
            }
        }

        // 5. Fallback
        if (melhorMov) {
            registrar(melhorMov.r, melhorMov.c);
            return melhorMov;
        }
        if (moves.length > 0) {
            registrar(moves[0][0], moves[0][1]);
            return { type: 'move', r: moves[0][0], c: moves[0][1] };
        }
        return null;
    }

    // ===== OVERRIDE scheduleIA: aplica SEMPRE via canPlace + placeWall do player =====
    if (typeof scheduleIA === 'function') {
        var _origScheduleIA = scheduleIA;
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA) return;
            if (G.turn !== 1) return;
            setIAThinking(true);
            var delay = 300;
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) return;
                stopTimer();

                if (act.type === 'move') {
                    // Revalida o movimento
                    var posA = [G.pos[0].slice(), G.pos[1].slice()];
                    var pHa = (G.pH || []).slice();
                    var pVa = (G.pV || []).slice();
                    var validos = legalMoves(1, pHa, pVa, posA);
                    var okMove = validos.some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!okMove) { nextTurn(); return; }

                    // Aplica via doMove do player
                    if (typeof doMove === 'function') {
                        doMove(act.r, act.c);
                        return;
                    }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin();
                    if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }

                if (act.type === 'wall') {
                    // Revalida com canPlace (mesma do player)
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        // Parede inválida — joga movimento
                        var posB = [G.pos[0].slice(), G.pos[1].slice()];
                        var mv = legalMoves(1, G.pH, G.pV, posB);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else {
                            nextTurn();
                        }
                        return;
                    }
                    // Aplica via placeWall (que também valida com canPlace)
                    if (typeof placeWall === 'function') {
                        placeWall(act.r + 1, act.c + 1, act.ori);
                        return;
                    }
                    // fallback
                    G.walls[1]--;
                    if (act.ori === 'H') { G.pH.push([act.r, act.c]); if (G.wallOwnerH) G.wallOwnerH.push(1); }
                    else { G.pV.push([act.r, act.c]); if (G.wallOwnerV) G.wallOwnerV.push(1); }
                    checkWin();
                    if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                }
            }, delay);
        };
    }

    window.iaJogarExpert = iaJogarExpert;

    console.log('IA_EXPERT_JUSTA ATIVO');
})();
// ===================== FIM IA_EXPERT_JUSTA =====================

// ===================== IA_EXPERT_FORTE =====================
(function () {
    var WIN = [0, 8];
    var ultimasPosicoes = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return ultimasPosicoes.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        ultimasPosicoes.push(posKey(r, c));
        if (ultimasPosicoes.length > 6) ultimasPosicoes.shift();
    }

    // ===== Auxiliares locais (cópia exata da lógica do player) =====
    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsDist(player, pH, pV, pos) {
        var goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (seen[key]) continue;
                seen[key] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    // Mesma validação do player
    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    // ===== Avaliação rica =====
    function avaliar(pos, pH, pV, walls) {
        var d0 = bfsDist(0, pH, pV, pos); // oponente (player humano)
        var d1 = bfsDist(1, pH, pV, pos); // IA
        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * 120;               // prioridade máxima: diferença
        score += (walls[1] - walls[0]) * 30;       // vantagem de paredes
        score += pos[1][0] * 40;                   // progresso da IA
        score -= (8 - pos[0][0]) * 25;             // progresso do oponente

        if (canWinNext(1, pH, pV, pos)) score += 6000;
        if (canWinNext(0, pH, pV, pos)) score -= 6000;

        // Bônus por mobilidade da IA (rotas alternativas)
        var mobIA = legalMoves(1, pH, pV, pos).length;
        if (mobIA >= 3) score += 30;
        else if (mobIA <= 1) score -= 60;

        return score;
    }

    // ===== Geração de ações candidatas =====
    function gerarAcoes(pos, pH, pV, walls, iaIdx) {
        var acoes = [];

        // Movimentos sem recuo (ou com recuo mínimo se bloqueado)
        var moves = legalMoves(iaIdx, pH, pV, pos);
        var avancos = moves.filter(function(m){ return m[0] > pos[iaIdx][0]; });
        var laterais = moves.filter(function(m){ return m[0] === pos[iaIdx][0]; });
        var recuos = moves.filter(function(m){ return m[0] < pos[iaIdx][0]; });

        var usar = avancos.length ? avancos : (laterais.length ? laterais : recuos);
        for (var i = 0; i < usar.length; i++) {
            acoes.push({ tipo: 'move', r: usar[i][0], c: usar[i][1] });
        }

        // Paredes que aumentam caminho do oponente
        if (walls[iaIdx] > 0) {
            var opp = 1 - iaIdx;
            var oppD = bfsDist(opp, pH, pV, pos);
            var meuD = bfsDist(iaIdx, pH, pV, pos);
            var paredes = [];
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                    var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                    if (gH > 0 && mgH <= 1) {
                        paredes.push({ tipo: 'wall', r: r, c: c, ori: 'H', ganho: gH, custo: mgH, score: gH * 15 - mgH * 8 });
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                    var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                    if (gV > 0 && mgV <= 1) {
                        paredes.push({ tipo: 'wall', r: r, c: c, ori: 'V', ganho: gV, custo: mgV, score: gV * 15 - mgV * 8 });
                    }
                }
            }
            paredes.sort(function(a, b){ return b.score - a.score; });
            for (var j = 0; j < Math.min(paredes.length, 10); j++) {
                acoes.push(paredes[j]);
            }
        }

        return acoes;
    }

    // ===== Aplicar ação em estado simulado =====
    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice();
        var npV = pV.slice();
        var nw = walls.slice();
        if (acao.tipo === 'move') {
            npos[cur] = [acao.r, acao.c];
        } else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    // ===== Decisão principal =====
    function decidir() {
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1;
        var oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type: 'move', r: winMoves[0][0], c: winMoves[0][1] };

        // 2. Bloqueio obrigatório de ameaça imediata
        var oppD = bfsDist(oppIdx, pH, pV, pos);
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var bloqueio = null, bloqueioScore = -1e15;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var sH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        if (sH > bloqueioScore) { bloqueioScore = sH; bloqueio = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var sV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        if (sV > bloqueioScore) { bloqueioScore = sV; bloqueio = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (bloqueio) return bloqueio;
        }

        // 3. Geração de ações + minimax raso
        var acoes = gerarAcoes(pos, pH, pV, walls, iaIdx);
        if (acoes.length === 0) return null;

        var melhorAcao = null, melhorScore = -1e15;
        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var sim = simular(pos, pH, pV, walls, a, iaIdx);

            // Avaliação 1 ply + resposta do oponente (1 ply extra)
            var val = avaliar(sim.pos, sim.pH, sim.pV, sim.walls);

            // Antecipação: melhor resposta do oponente
            var oppAcoes = gerarAcoes(sim.pos, sim.pH, sim.pV, sim.walls, oppIdx);
            if (oppAcoes.length > 0) {
                var piorResp = 1e15;
                for (var j = 0; j < Math.min(oppAcoes.length, 6); j++) {
                    var oa = oppAcoes[j];
                    var sim2 = simular(sim.pos, sim.pH, sim.pV, sim.walls, oa, oppIdx);
                    var v2 = avaliar(sim2.pos, sim2.pH, sim2.pV, sim2.walls);
                    if (v2 < piorResp) piorResp = v2;
                }
                val = val * 0.4 + piorResp * 0.6;
            }

            // Anti-loop
            if (a.tipo === 'move' && jaVisitou(a.r, a.c)) val -= 80;

            if (val > melhorScore) {
                melhorScore = val;
                melhorAcao = a;
            }
        }

        if (!melhorAcao) melhorAcao = acoes[0];

        // Converte para o formato esperado
        if (melhorAcao.tipo === 'move') {
            return { type: 'move', r: melhorAcao.r, c: melhorAcao.c };
        }
        return { type: 'wall', r: melhorAcao.r, c: melhorAcao.c, ori: melhorAcao.ori };
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        try {
            var act = decidir();
            if (act && act.type === 'move') registrar(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrar(fb[0][0], fb[0][1]);
                return { type: 'move', r: fb[0][0], c: fb[0][1] };
            }
            return null;
        }
    }

    // Override scheduleIA para aplicar SEMPRE via canPlace/placeWall
    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) return;
                stopTimer();

                if (act.type === 'move') {
                    var val = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!val) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin(); if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }

                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    console.log('IA_EXPERT_FORTE ATIVO');
})();
// ===================== FIM IA_EXPERT_FORTE =====================

// ===================== IA_EXPERT_VISAO_REAL =====================
(function () {
    var WIN = [0, 8];
    var historicoIA = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return historicoIA.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        historicoIA.push(posKey(r, c));
        if (historicoIA.length > 20) historicoIA.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    // BFS que retorna distância E caminho completo
    function bfsPath(player, pH, pV, pos) {
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var q = [start];
        var parent = {};
        parent[start[0] + ',' + start[1]] = null;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) {
                // Reconstruir caminho
                var path = [];
                var k = cur[0] + ',' + cur[1];
                while (k !== null) {
                    var parts = k.split(',');
                    path.unshift([parseInt(parts[0], 10), parseInt(parts[1], 10)]);
                    k = parent[k];
                }
                return { dist: path.length - 1, path: path };
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    }

    function bfsDist(player, pH, pV, pos) {
        return bfsPath(player, pH, pV, pos).dist;
    }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    // Avaliação baseada em caminho real
    function avaliar(pos, pH, pV, walls) {
        var p0 = bfsPath(0, pH, pV, pos);
        var p1 = bfsPath(1, pH, pV, pos);
        var d0 = p0.dist, d1 = p1.dist;

        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * 150;

        // Vantagem de paredes
        score += (walls[1] - walls[0]) * 25;

        // Progresso
        score += pos[1][0] * 40;
        score -= (8 - pos[0][0]) * 30;

        // Ameaças
        if (canWinNext(1, pH, pV, pos)) score += 7000;
        if (canWinNext(0, pH, pV, pos)) score -= 7000;

        // Penalizar se IA está atrás no caminho
        if (d1 > d0) score -= (d1 - d0) * 200;

        return score;
    }

    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice();
        var npV = pV.slice();
        var nw = walls.slice();
        if (acao.tipo === 'move') {
            npos[cur] = [acao.r, acao.c];
        } else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    // Gera TODAS as ações (movimentos e paredes válidas)
    function gerarAcoes(pos, pH, pV, walls, iaIdx, limiteParedes) {
        var acoes = [];
        var opp = 1 - iaIdx;
        var oppD = bfsDist(opp, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // Movimentos sem recuo
        var moves = legalMoves(iaIdx, pH, pV, pos);
        var naoRecuam = moves.filter(function(m){ return m[0] >= pos[iaIdx][0]; });
        if (naoRecuam.length === 0) naoRecuam = moves;
        for (var i = 0; i < naoRecuam.length; i++) {
            acoes.push({ tipo: 'move', r: naoRecuam[i][0], c: naoRecuam[i][1] });
        }

        // Paredes que atrasam oponente
        if (walls[iaIdx] > 0) {
            var paredes = [];
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                    var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                    if (gH > 0 && mgH <= 2) {
                        paredes.push({ tipo:'wall', r:r, c:c, ori:'H', ganho:gH, custo:mgH });
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                    var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                    if (gV > 0 && mgV <= 2) {
                        paredes.push({ tipo:'wall', r:r, c:c, ori:'V', ganho:gV, custo:mgV });
                    }
                }
            }
            paredes.sort(function(a, b){ return (b.ganho * 15 - b.custo * 8) - (a.ganho * 15 - a.custo * 8); });
            var lim = limiteParedes || 12;
            for (var j = 0; j < Math.min(paredes.length, lim); j++) acoes.push(paredes[j]);
        }
        return acoes;
    }

    // ===== DECISÃO PRINCIPAL =====
    function decidir() {
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };

        // 2. Bloqueio obrigatório (oponente a 1)
        var oppD = bfsDist(oppIdx, pH, pV, pos);
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var melhorBloqueio = null, melhorGanho = -1;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var gH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var selfH = bfsDist(iaIdx, tH, pV, pos) - bfsDist(iaIdx, pH, pV, pos);
                        if (selfH <= 1 && gH > melhorGanho) { melhorGanho = gH; melhorBloqueio = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var gV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var selfV = bfsDist(iaIdx, pH, tV, pos) - bfsDist(iaIdx, pH, pV, pos);
                        if (selfV <= 1 && gV > melhorGanho) { melhorGanho = gV; melhorBloqueio = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (melhorBloqueio) return melhorBloqueio;
        }

        // 3. Geração e avaliação com previsão
        var acoes = gerarAcoes(pos, pH, pV, walls, iaIdx, 14);
        if (acoes.length === 0) return null;

        var melhorAcao = null, melhorScore = -1e15;

        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var sim = simular(pos, pH, pV, walls, a, iaIdx);

            // Avaliação base
            var base = avaliar(sim.pos, sim.pH, sim.pV, sim.walls);

            // Se o oponente pode vencer no próximo turno após minha jogada, descarta
            if (canWinNext(oppIdx, sim.pH, sim.pV, sim.pos)) {
                base -= 20000;
            }

            // Previsão: melhor resposta do oponente (1 ply)
            var respostasOpp = gerarAcoes(sim.pos, sim.pH, sim.pV, sim.walls, oppIdx, 6);
            var piorResp = 1e15;
            for (var j = 0; j < Math.min(respostasOpp.length, 5); j++) {
                var oa = respostasOpp[j];
                var sim2 = simular(sim.pos, sim.pH, sim.pV, sim.walls, oa, oppIdx);
                var v2 = avaliar(sim2.pos, sim2.pH, sim2.pV, sim2.walls);
                if (v2 < piorResp) piorResp = v2;
            }
            var val = respostasOpp.length > 0 ? (base * 0.35 + piorResp * 0.65) : base;

            // Anti-loop forte
            if (a.tipo === 'move' && jaVisitou(a.r, a.c)) val -= 200;
            if (a.tipo === 'move' && a.r < pos[iaIdx][0]) val -= 300;

            if (val > melhorScore) {
                melhorScore = val;
                melhorAcao = a;
            }
        }

        if (!melhorAcao) melhorAcao = acoes[0];

        if (melhorAcao.tipo === 'move') {
            return { type:'move', r:melhorAcao.r, c:melhorAcao.c };
        }
        return { type:'wall', r:melhorAcao.r, c:melhorAcao.c, ori:melhorAcao.ori };
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        try {
            var act = decidir();
            if (act && act.type === 'move') registrar(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrar(fb[0][0], fb[0][1]);
                return { type:'move', r:fb[0][0], c:fb[0][1] };
            }
            return null;
        }
    }

    // Override scheduleIA: aplica SEMPRE via canPlace + placeWall do player
    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) { nextTurn(); return; }
                stopTimer();

                if (act.type === 'move') {
                    var valido = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!valido) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin();
                    if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }

                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            checkWin();
                            if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    console.log('IA_EXPERT_VISAO_REAL ATIVO');
})();
// ===================== FIM IA_EXPERT_VISAO_REAL =====================

// ===================== IA_EXPERT_ECONOMICA_V2 =====================
(function () {
    var WIN = [0, 8];
    var historicoIA = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return historicoIA.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        historicoIA.push(posKey(r, c));
        if (historicoIA.length > 20) historicoIA.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsPath(player, pH, pV, pos) {
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var q = [start];
        var parent = {};
        parent[start[0] + ',' + start[1]] = null;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) {
                var path = [];
                var k = cur[0] + ',' + cur[1];
                while (k !== null) {
                    var parts = k.split(',');
                    path.unshift([parseInt(parts[0], 10), parseInt(parts[1], 10)]);
                    k = parent[k];
                }
                return { dist: path.length - 1, path: path };
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    }

    function bfsDist(player, pH, pV, pos) { return bfsPath(player, pH, pV, pos).dist; }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function avaliar(pos, pH, pV, walls) {
        var p0 = bfsPath(0, pH, pV, pos);
        var p1 = bfsPath(1, pH, pV, pos);
        var d0 = p0.dist, d1 = p1.dist;
        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * 150;
        score += (walls[1] - walls[0]) * 45;  // valoriza muito ter mais paredes
        score += pos[1][0] * 40;
        score -= (8 - pos[0][0]) * 30;

        if (canWinNext(1, pH, pV, pos)) score += 7000;
        if (canWinNext(0, pH, pV, pos)) score -= 7000;

        if (d1 > d0) score -= (d1 - d0) * 200;

        return score;
    }

    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (acao.tipo === 'move') {
            npos[cur] = [acao.r, acao.c];
        } else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    // Paredes candidatas APENAS se tocarem o caminho real do oponente
    function paredesRelevantes(pos, pH, pV, walls, iaIdx) {
        if (walls[iaIdx] <= 0) return [];
        var opp = 1 - iaIdx;
        var caminhoOpp = bfsPath(opp, pH, pV, pos);
        var oppD = caminhoOpp.dist;
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // Conjunto de células do caminho do oponente (com margem de 1)
        var celulas = {};
        for (var k = 0; k < caminhoOpp.path.length; k++) {
            celulas[caminhoOpp.path[k][0] + ',' + caminhoOpp.path[k][1]] = true;
        }
        function tocaCaminho(r, c, ori) {
            // Verifica se a parede intercepta alguma célula do caminho do oponente
            if (ori === 'H') {
                // Parede entre (r, c) e (r+1, c) — bloqueia passagem vertical
                return celulas[r + ',' + c] || celulas[(r + 1) + ',' + c];
            } else {
                return celulas[r + ',' + c] || celulas[r + ',' + (c + 1)];
            }
        }

        var paredes = [];
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                if (!tocaCaminho(r, c, 'H')) continue;
                var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                if (gH >= 2 && mgH <= 1) {
                    paredes.push({ tipo:'wall', r:r, c:c, ori:'H', ganho:gH, custo:mgH });
                }
            }
            if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                if (!tocaCaminho(r, c, 'V')) continue;
                var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                if (gV >= 2 && mgV <= 1) {
                    paredes.push({ tipo:'wall', r:r, c:c, ori:'V', ganho:gV, custo:mgV });
                }
            }
        }
        paredes.sort(function(a, b){ return (b.ganho * 20 - b.custo * 10) - (a.ganho * 20 - a.custo * 10); });
        return paredes.slice(0, 5); // no máximo 5 candidatas por turno
    }

    function gerarAcoes(pos, pH, pV, walls, iaIdx, permitirParedes) {
        var acoes = [];
        var moves = legalMoves(iaIdx, pH, pV, pos);
        var naoRecuam = moves.filter(function(m){ return m[0] >= pos[iaIdx][0]; });
        if (naoRecuam.length === 0) naoRecuam = moves;
        for (var i = 0; i < naoRecuam.length; i++) {
            acoes.push({ tipo:'move', r:naoRecuam[i][0], c:naoRecuam[i][1] });
        }
        if (permitirParedes) {
            var paredes = paredesRelevantes(pos, pH, pV, walls, iaIdx);
            for (var j = 0; j < paredes.length; j++) acoes.push(paredes[j]);
        }
        return acoes;
    }

    function decidir() {
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };

        var oppD = bfsDist(oppIdx, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // 2. Bloqueio obrigatório (oponente a 1)
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var melhorBloqueio = null, melhorGanho = -1;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var gH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var selfH = bfsDist(iaIdx, tH, pV, pos) - meuD;
                        if (selfH <= 2 && gH > melhorGanho) { melhorGanho = gH; melhorBloqueio = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var gV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var selfV = bfsDist(iaIdx, pH, tV, pos) - meuD;
                        if (selfV <= 2 && gV > melhorGanho) { melhorGanho = gV; melhorBloqueio = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (melhorBloqueio) return melhorBloqueio;
        }

        // 3. Economia: se IA está claramente à frente e oponente longe, só avança
        var vantagemClara = (meuD + 2 < oppD);
        var oponenteLonge = (oppD >= 5);
        var permitirParedes = !(vantagemClara && oponenteLonge);

        // Se oponente muito perto (≤ 3), SEMPRE permite paredes
        if (oppD <= 3) permitirParedes = true;

        // Se IA está atrás, permite paredes para bloquear
        if (meuD > oppD) permitirParedes = true;

        var acoes = gerarAcoes(pos, pH, pV, walls, iaIdx, permitirParedes);
        if (acoes.length === 0) return null;

        var melhorAcao = null, melhorScore = -1e15;

        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var sim = simular(pos, pH, pV, walls, a, iaIdx);

            var base = avaliar(sim.pos, sim.pH, sim.pV, sim.walls);

            // Se oponente pode vencer depois da minha jogada, descarta
            if (canWinNext(oppIdx, sim.pH, sim.pV, sim.pos)) base -= 20000;

            // Previsão de 1 resposta do oponente
            var respostasOpp = [];
            var oppMoves = legalMoves(oppIdx, sim.pH, sim.pV, sim.pos);
            for (var j = 0; j < oppMoves.length; j++) respostasOpp.push({ tipo:'move', r:oppMoves[j][0], c:oppMoves[j][1] });
            var piorResp = 1e15;
            for (var j = 0; j < Math.min(respostasOpp.length, 5); j++) {
                var oa = respostasOpp[j];
                var sim2 = simular(sim.pos, sim.pH, sim.pV, sim.walls, oa, oppIdx);
                var v2 = avaliar(sim2.pos, sim2.pH, sim2.pV, sim2.walls);
                if (v2 < piorResp) piorResp = v2;
            }
            var val = respostasOpp.length > 0 ? (base * 0.4 + piorResp * 0.6) : base;

            // PUNIÇÃO FORTE por gastar parede
            if (a.tipo === 'wall') {
                val -= 800;                          // custo base de usar parede
                val -= (a.custo || 0) * 150;         // pune se atrapalha a própria IA
                val += (a.ganho || 0) * 100;         // bonifica se atrasa oponente
                if (walls[iaIdx] <= 2) val -= 1200;  // economiza as últimas paredes
            }

            // Anti-loop
            if (a.tipo === 'move' && jaVisitou(a.r, a.c)) val -= 250;

            if (val > melhorScore) {
                melhorScore = val;
                melhorAcao = a;
            }
        }

        if (!melhorAcao) melhorAcao = acoes[0];

        if (melhorAcao.tipo === 'move') {
            return { type:'move', r:melhorAcao.r, c:melhorAcao.c };
        }
        return { type:'wall', r:melhorAcao.r, c:melhorAcao.c, ori:melhorAcao.ori };
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        try {
            var act = decidir();
            if (act && act.type === 'move') registrar(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrar(fb[0][0], fb[0][1]);
                return { type:'move', r:fb[0][0], c:fb[0][1] };
            }
            return null;
        }
    }

    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) { nextTurn(); return; }
                stopTimer();

                if (act.type === 'move') {
                    var val = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!val) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin(); if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }

                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            checkWin(); if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    console.log('IA_EXPERT_ECONOMICA_V2 ATIVO');
})();
// ===================== FIM IA_EXPERT_ECONOMICA_V2 =====================

// ===================== IA_EXPERT_GPS =====================
(function () {
    var WIN = [0, 8];
    var historicoIA = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return historicoIA.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        historicoIA.push(posKey(r, c));
        if (historicoIA.length > 20) historicoIA.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    // ===== BFS com caminho completo (GPS) =====
    function bfsPath(player, pH, pV, pos) {
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var q = [start];
        var parent = {};
        parent[start[0] + ',' + start[1]] = null;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) {
                var path = [];
                var k = cur[0] + ',' + cur[1];
                while (k !== null) {
                    var parts = k.split(',');
                    path.unshift([parseInt(parts[0], 10), parseInt(parts[1], 10)]);
                    k = parent[k];
                }
                return { dist: path.length - 1, path: path };
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    }

    function bfsDist(player, pH, pV, pos) { return bfsPath(player, pH, pV, pos).dist; }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function avaliar(pos, pH, pV, walls) {
        var p0 = bfsPath(0, pH, pV, pos);
        var p1 = bfsPath(1, pH, pV, pos);
        var d0 = p0.dist, d1 = p1.dist;
        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * 150;
        score += (walls[1] - walls[0]) * 45;
        score += pos[1][0] * 40;
        score -= (8 - pos[0][0]) * 30;
        if (canWinNext(1, pH, pV, pos)) score += 7000;
        if (canWinNext(0, pH, pV, pos)) score -= 7000;
        if (d1 > d0) score -= (d1 - d0) * 200;
        return score;
    }

    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (acao.tipo === 'move') npos[cur] = [acao.r, acao.c];
        else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    function paredesRelevantes(pos, pH, pV, walls, iaIdx) {
        if (walls[iaIdx] <= 0) return [];
        var opp = 1 - iaIdx;
        var caminhoOpp = bfsPath(opp, pH, pV, pos);
        var oppD = caminhoOpp.dist;
        var meuD = bfsDist(iaIdx, pH, pV, pos);
        var celulas = {};
        for (var k = 0; k < caminhoOpp.path.length; k++) {
            celulas[caminhoOpp.path[k][0] + ',' + caminhoOpp.path[k][1]] = true;
        }
        function toca(r, c, ori) {
            if (ori === 'H') return celulas[r + ',' + c] || celulas[(r + 1) + ',' + c];
            return celulas[r + ',' + c] || celulas[r + ',' + (c + 1)];
        }
        var paredes = [];
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'H')) continue;
                var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                if (gH >= 2 && mgH <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'H', ganho:gH, custo:mgH });
            }
            if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'V')) continue;
                var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                if (gV >= 2 && mgV <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'V', ganho:gV, custo:mgV });
            }
        }
        paredes.sort(function(a, b){ return (b.ganho * 20 - b.custo * 10) - (a.ganho * 20 - a.custo * 10); });
        return paredes.slice(0, 5);
    }

    // ===== GPS: escolhe o próximo passo do caminho mais curto =====
    function proximoPassoGPS(pH, pV, pos, iaIdx) {
        var rota = bfsPath(iaIdx, pH, pV, pos);
        if (!rota.path || rota.path.length < 2) return null;
        return rota.path[1]; // próxima célula do caminho mínimo
    }

    function decidir() {
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };

        var oppD = bfsDist(oppIdx, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // 2. Bloqueio obrigatório de ameaça (oponente a 1)
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var melhorB = null, melhorG = -1;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var gH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var sH = bfsDist(iaIdx, tH, pV, pos) - meuD;
                        if (sH <= 2 && gH > melhorG) { melhorG = gH; melhorB = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var gV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var sV = bfsDist(iaIdx, pH, tV, pos) - meuD;
                        if (sV <= 2 && gV > melhorG) { melhorG = gV; melhorB = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (melhorB) return melhorB;
        }

        // ===== 3. GPS: seguir o próximo passo do caminho mais curto =====
        // Independente de ser para frente, para o lado ou para trás.
        var passoGPS = proximoPassoGPS(pH, pV, pos, iaIdx);
        if (passoGPS) {
            var moves = legalMoves(iaIdx, pH, pV, pos);
            var valido = moves.some(function(m){ return m[0] === passoGPS[0] && m[1] === passoGPS[1]; });
            if (valido) {
                // Se oponente muito perto e temos paredes, considerar bloqueio antes
                if (oppD <= 3 && walls[iaIdx] > 0) {
                    var paredes = paredesRelevantes(pos, pH, pV, walls, iaIdx);
                    if (paredes.length > 0 && paredes[0].ganho >= 3) {
                        return { type:'wall', r:paredes[0].r, c:paredes[0].c, ori:paredes[0].ori };
                    }
                }
                return { type:'move', r:passoGPS[0], c:passoGPS[1] };
            }
        }

        // 4. Se GPS falhou, usar geração de ações (fallback)
        var acoes = [];
        var movesAll = legalMoves(iaIdx, pH, pV, pos);
        for (var i = 0; i < movesAll.length; i++) {
            acoes.push({ tipo:'move', r:movesAll[i][0], c:movesAll[i][1] });
        }
        if (walls[iaIdx] > 0 && oppD <= 4) {
            var ps = paredesRelevantes(pos, pH, pV, walls, iaIdx);
            for (var j = 0; j < ps.length; j++) acoes.push(ps[j]);
        }

        var melhorAcao = null, melhorScore = -1e15;
        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var sim = simular(pos, pH, pV, walls, a, iaIdx);
            var base = avaliar(sim.pos, sim.pH, sim.pV, sim.walls);
            if (canWinNext(oppIdx, sim.pH, sim.pV, sim.pos)) base -= 20000;

            var respostasOpp = legalMoves(oppIdx, sim.pH, sim.pV, sim.pos);
            var piorResp = 1e15;
            for (var j = 0; j < Math.min(respostasOpp.length, 5); j++) {
                var sim2 = simular(sim.pos, sim.pH, sim.pV, sim.walls, { tipo:'move', r:respostasOpp[j][0], c:respostasOpp[j][1] }, oppIdx);
                var v2 = avaliar(sim2.pos, sim2.pH, sim2.pV, sim2.walls);
                if (v2 < piorResp) piorResp = v2;
            }
            var val = respostasOpp.length > 0 ? (base * 0.4 + piorResp * 0.6) : base;

            if (a.tipo === 'wall') {
                val -= 800;
                val -= (a.custo || 0) * 150;
                val += (a.ganho || 0) * 100;
                if (walls[iaIdx] <= 2) val -= 1200;
            }
            if (a.tipo === 'move' && jaVisitou(a.r, a.c)) val -= 250;
            if (val > melhorScore) { melhorScore = val; melhorAcao = a; }
        }

        if (!melhorAcao && acoes.length > 0) melhorAcao = acoes[0];
        if (!melhorAcao) return null;
        if (melhorAcao.tipo === 'move') return { type:'move', r:melhorAcao.r, c:melhorAcao.c };
        return { type:'wall', r:melhorAcao.r, c:melhorAcao.c, ori:melhorAcao.ori };
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        try {
            var act = decidir();
            if (act && act.type === 'move') registrar(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrar(fb[0][0], fb[0][1]);
                return { type:'move', r:fb[0][0], c:fb[0][1] };
            }
            return null;
        }
    }

    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) { nextTurn(); return; }
                stopTimer();

                if (act.type === 'move') {
                    var val = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!val) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin(); if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }
                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            checkWin(); if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    console.log('IA_EXPERT_GPS ATIVO');
})();
// ===================== FIM IA_EXPERT_GPS =====================

// ===================== IA_EXPERT_1000_PERFIS =====================
(function () {
    var WIN = [0, 8];
    var historicoIA = [];

    // ===== 1000 PERFIS (gerados por fórmula, mas fixos em runtime) =====
    var PERFIS_EXPERT = (function () {
        var lista = [];
        var pesosDiferenca = [150, 165, 180, 195, 210, 225, 240, 250];
        var pesosParede    = [20, 30, 40, 50, 60, 70, 80];
        var agressividades = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
        var ganhosMin      = [2, 3, 4, 5];
        var profundidades  = [2, 3, 4, 5];
        var bonusAvancos   = [20, 30, 40, 50, 60];
        var estilos        = ['centro', 'lateral', 'agressivo', 'defensivo', 'equilibrado'];

        for (var i = 0; i < 1000; i++) {
            lista.push({
                pesoDiferenca: pesosDiferenca[i % pesosDiferenca.length],
                pesoParede: pesosParede[(i * 3) % pesosParede.length],
                agressividade: agressividades[(i * 7) % agressividades.length],
                ganhoMinParede: ganhosMin[(i * 11) % ganhosMin.length],
                profundidadePrevisao: profundidades[(i * 13) % profundidades.length],
                bonusAvanco: bonusAvancos[(i * 17) % bonusAvancos.length],
                estilo: estilos[(i * 19) % estilos.length]
            });
        }
        return lista;
    })();

    // Sorteia um perfil por partida (guardado em G._perfilExpert para não mudar no meio)
    function getPerfilAtual() {
        if (!G._perfilExpert) {
            G._perfilExpert = PERFIS_EXPERT[Math.floor(Math.random() * PERFIS_EXPERT.length)];
        }
        return G._perfilExpert;
    }

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return historicoIA.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        historicoIA.push(posKey(r, c));
        if (historicoIA.length > 20) historicoIA.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsPath(player, pH, pV, pos) {
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var q = [start];
        var parent = {};
        parent[start[0] + ',' + start[1]] = null;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) {
                var path = [];
                var k = cur[0] + ',' + cur[1];
                while (k !== null) {
                    var parts = k.split(',');
                    path.unshift([parseInt(parts[0], 10), parseInt(parts[1], 10)]);
                    k = parent[k];
                }
                return { dist: path.length - 1, path: path };
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    }

    function bfsDist(player, pH, pV, pos) { return bfsPath(player, pH, pV, pos).dist; }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function avaliar(pos, pH, pV, walls, perfil) {
        var p0 = bfsPath(0, pH, pV, pos);
        var p1 = bfsPath(1, pH, pV, pos);
        var d0 = p0.dist, d1 = p1.dist;
        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * perfil.pesoDiferenca;
        score += (walls[1] - walls[0]) * perfil.pesoParede;
        score += pos[1][0] * perfil.bonusAvanco;
        score -= (8 - pos[0][0]) * perfil.bonusAvanco * 0.75;
        if (canWinNext(1, pH, pV, pos)) score += 7000;
        if (canWinNext(0, pH, pV, pos)) score -= 7000;
        if (d1 > d0) score -= (d1 - d0) * 200;

        // Estilo: agressividade aumenta valor de atrasar oponente
        if (d0 > d1) score += (d0 - d1) * perfil.agressividade * 40;

        return score;
    }

    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (acao.tipo === 'move') npos[cur] = [acao.r, acao.c];
        else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    function paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil) {
        if (walls[iaIdx] <= 0) return [];
        var opp = 1 - iaIdx;
        var caminhoOpp = bfsPath(opp, pH, pV, pos);
        var oppD = caminhoOpp.dist;
        var meuD = bfsDist(iaIdx, pH, pV, pos);
        var celulas = {};
        for (var k = 0; k < caminhoOpp.path.length; k++) {
            celulas[caminhoOpp.path[k][0] + ',' + caminhoOpp.path[k][1]] = true;
        }
        function toca(r, c, ori) {
            if (ori === 'H') return celulas[r + ',' + c] || celulas[(r + 1) + ',' + c];
            return celulas[r + ',' + c] || celulas[r + ',' + (c + 1)];
        }
        var paredes = [];
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'H')) continue;
                var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                if (gH >= perfil.ganhoMinParede && mgH <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'H', ganho:gH, custo:mgH });
            }
            if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'V')) continue;
                var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                if (gV >= perfil.ganhoMinParede && mgV <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'V', ganho:gV, custo:mgV });
            }
        }
        paredes.sort(function(a, b){ return (b.ganho * 20 - b.custo * 10) - (a.ganho * 20 - a.custo * 10); });
        return paredes.slice(0, 5);
    }

    function proximoPassoGPS(pH, pV, pos, iaIdx, perfil) {
        var rota = bfsPath(iaIdx, pH, pV, pos);
        if (!rota.path || rota.path.length < 2) return null;

        // Estilo influencia pequenas variações: às vezes escolhe passo alternativo equivalente
        if (perfil.estilo === 'lateral' && rota.path.length > 3 && Math.random() < 0.15) {
            // Escolhe caminho alternativo com mesma distância
            var moves = legalMoves(iaIdx, pH, pV, pos);
            var alternativas = [];
            for (var i = 0; i < moves.length; i++) {
                var m = moves[i];
                var npos = [pos[0].slice(), pos[1].slice()];
                npos[iaIdx] = [m[0], m[1]];
                var d = bfsDist(iaIdx, pH, pV, npos);
                if (d === rota.dist - 1) alternativas.push([m[0], m[1]]);
            }
            if (alternativas.length > 0) {
                return alternativas[Math.floor(Math.random() * alternativas.length)];
            }
        }
        return rota.path[1];
    }

    function decidir() {
        var perfil = getPerfilAtual();
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };

        var oppD = bfsDist(oppIdx, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // 2. Bloqueio obrigatório
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var melhorB = null, melhorG = -1;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var gH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var sH = bfsDist(iaIdx, tH, pV, pos) - meuD;
                        if (sH <= 2 && gH > melhorG) { melhorG = gH; melhorB = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var gV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var sV = bfsDist(iaIdx, pH, tV, pos) - meuD;
                        if (sV <= 2 && gV > melhorG) { melhorG = gV; melhorB = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (melhorB) return melhorB;
        }

        // 3. GPS
        var passoGPS = proximoPassoGPS(pH, pV, pos, iaIdx, perfil);
        if (passoGPS) {
            var moves = legalMoves(iaIdx, pH, pV, pos);
            var valido = moves.some(function(m){ return m[0] === passoGPS[0] && m[1] === passoGPS[1]; });
            if (valido) {
                // Estilo "agressivo" ou "defensivo" interfere
                var limiarBloqueio = perfil.estilo === 'agressivo' ? 4 : perfil.estilo === 'defensivo' ? 2 : 3;
                if (oppD <= limiarBloqueio && walls[iaIdx] > 0) {
                    var paredes = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
                    if (paredes.length > 0 && paredes[0].ganho >= perfil.ganhoMinParede) {
                        return { type:'wall', r:paredes[0].r, c:paredes[0].c, ori:paredes[0].ori };
                    }
                }
                return { type:'move', r:passoGPS[0], c:passoGPS[1] };
            }
        }

        // 4. Fallback com geração de ações
        var acoes = [];
        var movesAll = legalMoves(iaIdx, pH, pV, pos);
        for (var i = 0; i < movesAll.length; i++) {
            acoes.push({ tipo:'move', r:movesAll[i][0], c:movesAll[i][1] });
        }
        if (walls[iaIdx] > 0 && oppD <= 4) {
            var ps = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
            for (var j = 0; j < ps.length; j++) acoes.push(ps[j]);
        }

        var melhorAcao = null, melhorScore = -1e15;
        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var sim = simular(pos, pH, pV, walls, a, iaIdx);
            var base = avaliar(sim.pos, sim.pH, sim.pV, sim.walls, perfil);
            if (canWinNext(oppIdx, sim.pH, sim.pV, sim.pos)) base -= 20000;

            var respostasOpp = legalMoves(oppIdx, sim.pH, sim.pV, sim.pos);
            var piorResp = 1e15;
            var limite = Math.min(respostasOpp.length, perfil.profundidadePrevisao);
            for (var j = 0; j < limite; j++) {
                var sim2 = simular(sim.pos, sim.pH, sim.pV, sim.walls, { tipo:'move', r:respostasOpp[j][0], c:respostasOpp[j][1] }, oppIdx);
                var v2 = avaliar(sim2.pos, sim2.pH, sim2.pV, sim2.walls, perfil);
                if (v2 < piorResp) piorResp = v2;
            }
            var val = respostasOpp.length > 0 ? (base * 0.4 + piorResp * 0.6) : base;

            if (a.tipo === 'wall') {
                val -= 800;
                val -= (a.custo || 0) * 150;
                val += (a.ganho || 0) * 100;
                if (walls[iaIdx] <= 2) val -= 1200;
                val -= perfil.pesoParede * 5;
            }
            if (a.tipo === 'move' && jaVisitou(a.r, a.c)) val -= 250;
            if (val > melhorScore) { melhorScore = val; melhorAcao = a; }
        }

        if (!melhorAcao && acoes.length > 0) melhorAcao = acoes[0];
        if (!melhorAcao) return null;
        if (melhorAcao.tipo === 'move') return { type:'move', r:melhorAcao.r, c:melhorAcao.c };
        return { type:'wall', r:melhorAcao.r, c:melhorAcao.c, ori:melhorAcao.ori };
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        // Sorteia perfil novo em cada nova partida
        if (!G._perfilExpert) G._perfilExpert = getPerfilAtual();
        try {
            var act = decidir();
            if (act && act.type === 'move') registrar(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrar(fb[0][0], fb[0][1]);
                return { type:'move', r:fb[0][0], c:fb[0][1] };
            }
            return null;
        }
    }

    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) { nextTurn(); return; }
                stopTimer();

                if (act.type === 'move') {
                    var val = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!val) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin(); if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }
                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            checkWin(); if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    // Limpa o perfil ao iniciar nova partida contra Expert
    if (typeof resetGame === 'function') {
        var _origReset = resetGame;
        window.resetGame = resetGame = function () {
            if (G && G.vsIA) G._perfilExpert = null;
            return _origReset.apply(this, arguments);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    window.PERFIS_EXPERT = PERFIS_EXPERT;
    console.log('IA_EXPERT_1000_PERFIS ATIVO (' + PERFIS_EXPERT.length + ' perfis)');
})();
// ===================== FIM IA_EXPERT_1000_PERFIS =====================

// ===================== IA_EXPERT_ANTI_BRECHA =====================
(function () {
    var WIN = [0, 8];
    var historicoIA = [];

    // Reaproveita os perfis já criados, ou gera se não existirem
    var PERFIS_EXPERT = window.PERFIS_EXPERT || (function () {
        var lista = [];
        var pesosDiferenca = [150, 165, 180, 195, 210, 225, 240, 250];
        var pesosParede    = [20, 30, 40, 50, 60, 70, 80];
        var agressividades = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
        var ganhosMin      = [2, 3, 4, 5];
        var profundidades  = [2, 3, 4, 5];
        var bonusAvancos   = [20, 30, 40, 50, 60];
        var estilos        = ['centro', 'lateral', 'agressivo', 'defensivo', 'equilibrado'];
        for (var i = 0; i < 1000; i++) {
            lista.push({
                pesoDiferenca: pesosDiferenca[i % pesosDiferenca.length],
                pesoParede: pesosParede[(i * 3) % pesosParede.length],
                agressividade: agressividades[(i * 7) % agressividades.length],
                ganhoMinParede: ganhosMin[(i * 11) % ganhosMin.length],
                profundidadePrevisao: profundidades[(i * 13) % profundidades.length],
                bonusAvanco: bonusAvancos[(i * 17) % bonusAvancos.length],
                estilo: estilos[(i * 19) % estilos.length]
            });
        }
        window.PERFIS_EXPERT = lista;
        return lista;
    })();

    function getPerfilAtual() {
        if (!G._perfilExpert) G._perfilExpert = PERFIS_EXPERT[Math.floor(Math.random() * PERFIS_EXPERT.length)];
        return G._perfilExpert;
    }

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return historicoIA.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        historicoIA.push(posKey(r, c));
        if (historicoIA.length > 20) historicoIA.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsPath(player, pH, pV, pos) {
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var q = [start];
        var parent = {};
        parent[start[0] + ',' + start[1]] = null;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) {
                var path = [];
                var k = cur[0] + ',' + cur[1];
                while (k !== null) {
                    var parts = k.split(',');
                    path.unshift([parseInt(parts[0], 10), parseInt(parts[1], 10)]);
                    k = parent[k];
                }
                return { dist: path.length - 1, path: path };
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    }

    function bfsDist(player, pH, pV, pos) { return bfsPath(player, pH, pV, pos).dist; }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    // Verifica se, na próxima jogada dele, o oponente pode chegar a 1 (ameaça em 2)
    function oponenteAmeacaEm2(pH, pV, pos, oppIdx) {
        var moves = legalMoves(oppIdx, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) {
            var npos = [pos[0].slice(), pos[1].slice()];
            npos[oppIdx] = [moves[i][0], moves[i][1]];
            if (moves[i][0] === WIN[oppIdx]) return true; // vence agora
            if (bfsDist(oppIdx, pH, pV, npos) === 1) return true; // chega a 1
        }
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function avaliar(pos, pH, pV, walls, perfil) {
        var p0 = bfsPath(0, pH, pV, pos);
        var p1 = bfsPath(1, pH, pV, pos);
        var d0 = p0.dist, d1 = p1.dist;
        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * perfil.pesoDiferenca;
        score += (walls[1] - walls[0]) * perfil.pesoParede;
        score += pos[1][0] * perfil.bonusAvanco;
        score -= (8 - pos[0][0]) * perfil.bonusAvanco * 0.75;
        if (canWinNext(1, pH, pV, pos)) score += 7000;
        if (canWinNext(0, pH, pV, pos)) score -= 7000;
        if (d1 > d0) score -= (d1 - d0) * 200;
        if (d0 > d1) score += (d0 - d1) * perfil.agressividade * 40;

        // ===== ANTI-BRECHA: oponente próximo ganha bônus de defesa =====
        if (d0 <= 3) score -= (4 - d0) * 2500;  // oponente perto é perigo
        if (d0 === 2) score -= 3000;
        if (d0 === 3) score -= 1500;

        return score;
    }

    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (acao.tipo === 'move') npos[cur] = [acao.r, acao.c];
        else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    function paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil) {
        if (walls[iaIdx] <= 0) return [];
        var opp = 1 - iaIdx;
        var caminhoOpp = bfsPath(opp, pH, pV, pos);
        var oppD = caminhoOpp.dist;
        var meuD = bfsDist(iaIdx, pH, pV, pos);
        var celulas = {};
        for (var k = 0; k < caminhoOpp.path.length; k++) {
            celulas[caminhoOpp.path[k][0] + ',' + caminhoOpp.path[k][1]] = true;
        }
        function toca(r, c, ori) {
            if (ori === 'H') return celulas[r + ',' + c] || celulas[(r + 1) + ',' + c];
            return celulas[r + ',' + c] || celulas[r + ',' + (c + 1)];
        }
        var paredes = [];
        var ganhoMin = oppD <= 3 ? 1 : perfil.ganhoMinParede; // em fase crítica aceita ganho 1
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'H')) continue;
                var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                if (gH >= ganhoMin && mgH <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'H', ganho:gH, custo:mgH });
            }
            if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'V')) continue;
                var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                if (gV >= ganhoMin && mgV <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'V', ganho:gV, custo:mgV });
            }
        }
        paredes.sort(function(a, b){ return (b.ganho * 20 - b.custo * 10) - (a.ganho * 20 - a.custo * 10); });
        return paredes.slice(0, 6);
    }

    function proximoPassoGPS(pH, pV, pos, iaIdx, perfil) {
        var rota = bfsPath(iaIdx, pH, pV, pos);
        if (!rota.path || rota.path.length < 2) return null;
        return rota.path[1];
    }

    function decidir() {
        var perfil = getPerfilAtual();
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };

        var oppD = bfsDist(oppIdx, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // ===== FASE DO JOGO =====
        var faseFinal = (oppD <= 3);
        var faseCritica = (oppD <= 2 || oponenteAmeacaEm2(pH, pV, pos, oppIdx));
        var paredesReserva = 2;
        var temReserva = walls[iaIdx] > paredesReserva;

        // 2. Bloqueio obrigatório imediato (oppD == 1)
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var melhorB = null, melhorG = -1;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var gH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var sH = bfsDist(iaIdx, tH, pV, pos) - meuD;
                        if (sH <= 3 && gH > melhorG) { melhorG = gH; melhorB = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var gV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var sV = bfsDist(iaIdx, pH, tV, pos) - meuD;
                        if (sV <= 3 && gV > melhorG) { melhorG = gV; melhorB = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (melhorB) return melhorB;
        }

        // 3. BLOQUEIO PREVENTIVO (oppD <= 3 ou ameaça em 2)
        if ((faseFinal || faseCritica) && walls[iaIdx] > 0) {
            var paredes = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
            if (paredes.length > 0 && paredes[0].ganho >= 1) {
                return { type:'wall', r:paredes[0].r, c:paredes[0].c, ori:paredes[0].ori };
            }
        }

        // 4. GPS: avanço pelo caminho mais curto
        var passoGPS = proximoPassoGPS(pH, pV, pos, iaIdx, perfil);
        if (passoGPS) {
            var moves = legalMoves(iaIdx, pH, pV, pos);
            var valido = moves.some(function(m){ return m[0] === passoGPS[0] && m[1] === passoGPS[1]; });
            if (valido) {
                // Meio-jogo: bloqueio médio se oponente em 4-5
                if (oppD <= 5 && oppD > 3 && temReserva) {
                    var paredesMed = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
                    if (paredesMed.length > 0 && paredesMed[0].ganho >= 3) {
                        return { type:'wall', r:paredesMed[0].r, c:paredesMed[0].c, ori:paredesMed[0].ori };
                    }
                }
                return { type:'move', r:passoGPS[0], c:passoGPS[1] };
            }
        }

        // 5. Fallback
        var acoes = [];
        var movesAll = legalMoves(iaIdx, pH, pV, pos);
        for (var i = 0; i < movesAll.length; i++) acoes.push({ tipo:'move', r:movesAll[i][0], c:movesAll[i][1] });
        if (walls[iaIdx] > 0 && (oppD <= 5 || !temReserva)) {
            var ps = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
            for (var j = 0; j < ps.length; j++) acoes.push(ps[j]);
        }

        var melhorAcao = null, melhorScore = -1e15;
        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var sim = simular(pos, pH, pV, walls, a, iaIdx);
            var base = avaliar(sim.pos, sim.pH, sim.pV, sim.walls, perfil);
            if (canWinNext(oppIdx, sim.pH, sim.pV, sim.pos)) base -= 30000;

            var val = base;

            if (a.tipo === 'wall') {
                val -= 800;
                val -= (a.custo || 0) * 150;
                val += (a.ganho || 0) * 100;
                if (walls[iaIdx] <= paredesReserva && !faseFinal) val -= 3000; // guardar reserva
                if (faseFinal) val += 2000; // no final, gastar vale
                val -= perfil.pesoParede * 5;
            }
            if (a.tipo === 'move' && jaVisitou(a.r, a.c)) val -= 250;
            if (val > melhorScore) { melhorScore = val; melhorAcao = a; }
        }

        if (!melhorAcao && acoes.length > 0) melhorAcao = acoes[0];
        if (!melhorAcao) return null;
        if (melhorAcao.tipo === 'move') return { type:'move', r:melhorAcao.r, c:melhorAcao.c };
        return { type:'wall', r:melhorAcao.r, c:melhorAcao.c, ori:melhorAcao.ori };
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        if (!G._perfilExpert) G._perfilExpert = getPerfilAtual();
        try {
            var act = decidir();
            if (act && act.type === 'move') registrar(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrar(fb[0][0], fb[0][1]);
                return { type:'move', r:fb[0][0], c:fb[0][1] };
            }
            return null;
        }
    }

    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) { nextTurn(); return; }
                stopTimer();

                if (act.type === 'move') {
                    var val = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!val) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin(); if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }
                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            checkWin(); if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    if (typeof resetGame === 'function') {
        var _origReset = resetGame;
        window.resetGame = resetGame = function () {
            if (G && G.vsIA) G._perfilExpert = null;
            return _origReset.apply(this, arguments);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    console.log('IA_EXPERT_ANTI_BRECHA ATIVO');
})();
// ===================== FIM IA_EXPERT_ANTI_BRECHA =====================

// ===================== IA_EXPERT_100_ABERTURAS_100_HIST =====================
(function () {
    var WIN = [0, 8];
    var historicoIA = [];

    // ===== 100 ABERTURAS ÚNICAS =====
    var OPENINGS_EXPERT = [
        // 30 movimentos centrais
        { type:'move', r:1, c:4 }, { type:'move', r:2, c:4 }, { type:'move', r:3, c:4 },
        { type:'move', r:1, c:3 }, { type:'move', r:1, c:5 }, { type:'move', r:2, c:3 },
        { type:'move', r:2, c:5 }, { type:'move', r:3, c:3 }, { type:'move', r:3, c:5 },
        { type:'move', r:1, c:4 }, { type:'move', r:2, c:4 }, { type:'move', r:3, c:4 },
        { type:'move', r:1, c:2 }, { type:'move', r:1, c:6 }, { type:'move', r:2, c:2 },
        { type:'move', r:2, c:6 }, { type:'move', r:3, c:2 }, { type:'move', r:3, c:6 },
        { type:'move', r:1, c:4 }, { type:'move', r:2, c:3 }, { type:'move', r:2, c:5 },
        { type:'move', r:1, c:3 }, { type:'move', r:1, c:5 }, { type:'move', r:2, c:4 },
        { type:'move', r:3, c:4 }, { type:'move', r:1, c:4 }, { type:'move', r:2, c:4 },
        { type:'move', r:3, c:3 }, { type:'move', r:3, c:5 }, { type:'move', r:1, c:4 },
        // 20 movimentos laterais
        { type:'move', r:1, c:1 }, { type:'move', r:1, c:7 }, { type:'move', r:2, c:1 },
        { type:'move', r:2, c:7 }, { type:'move', r:3, c:1 }, { type:'move', r:3, c:7 },
        { type:'move', r:1, c:0 }, { type:'move', r:1, c:8 }, { type:'move', r:2, c:0 },
        { type:'move', r:2, c:8 }, { type:'move', r:3, c:0 }, { type:'move', r:3, c:8 },
        { type:'move', r:1, c:2 }, { type:'move', r:1, c:6 }, { type:'move', r:2, c:1 },
        { type:'move', r:2, c:7 }, { type:'move', r:3, c:2 }, { type:'move', r:3, c:6 },
        { type:'move', r:2, c:0 }, { type:'move', r:2, c:8 },
        // 25 paredes verticais
        { type:'wall', r:1, c:4, ori:'V' }, { type:'wall', r:2, c:4, ori:'V' },
        { type:'wall', r:3, c:4, ori:'V' }, { type:'wall', r:1, c:3, ori:'V' },
        { type:'wall', r:1, c:5, ori:'V' }, { type:'wall', r:2, c:3, ori:'V' },
        { type:'wall', r:2, c:5, ori:'V' }, { type:'wall', r:3, c:3, ori:'V' },
        { type:'wall', r:3, c:5, ori:'V' }, { type:'wall', r:2, c:2, ori:'V' },
        { type:'wall', r:2, c:6, ori:'V' }, { type:'wall', r:1, c:2, ori:'V' },
        { type:'wall', r:1, c:6, ori:'V' }, { type:'wall', r:3, c:2, ori:'V' },
        { type:'wall', r:3, c:6, ori:'V' }, { type:'wall', r:4, c:4, ori:'V' },
        { type:'wall', r:4, c:3, ori:'V' }, { type:'wall', r:4, c:5, ori:'V' },
        { type:'wall', r:5, c:4, ori:'V' }, { type:'wall', r:0, c:4, ori:'V' },
        { type:'wall', r:0, c:3, ori:'V' }, { type:'wall', r:0, c:5, ori:'V' },
        { type:'wall', r:4, c:2, ori:'V' }, { type:'wall', r:4, c:6, ori:'V' },
        { type:'wall', r:5, c:3, ori:'V' },
        // 20 paredes horizontais
        { type:'wall', r:1, c:4, ori:'H' }, { type:'wall', r:1, c:3, ori:'H' },
        { type:'wall', r:1, c:5, ori:'H' }, { type:'wall', r:2, c:3, ori:'H' },
        { type:'wall', r:2, c:4, ori:'H' }, { type:'wall', r:3, c:3, ori:'H' },
        { type:'wall', r:3, c:4, ori:'H' }, { type:'wall', r:1, c:2, ori:'H' },
        { type:'wall', r:1, c:6, ori:'H' }, { type:'wall', r:2, c:2, ori:'H' },
        { type:'wall', r:2, c:6, ori:'H' }, { type:'wall', r:3, c:2, ori:'H' },
        { type:'wall', r:3, c:6, ori:'H' }, { type:'wall', r:0, c:4, ori:'H' },
        { type:'wall', r:0, c:3, ori:'H' }, { type:'wall', r:0, c:5, ori:'H' },
        { type:'wall', r:4, c:4, ori:'H' }, { type:'wall', r:4, c:3, ori:'H' },
        { type:'wall', r:4, c:5, ori:'H' }, { type:'wall', r:5, c:4, ori:'H' },
        // 5 combinações (movimento seguido de parede no início)
        { type:'move', r:1, c:4, followWall: { r:1, c:3, ori:'V' } },
        { type:'move', r:1, c:4, followWall: { r:1, c:5, ori:'V' } },
        { type:'move', r:1, c:3, followWall: { r:1, c:2, ori:'H' } },
        { type:'move', r:1, c:5, followWall: { r:1, c:6, ori:'H' } },
        { type:'move', r:2, c:4, followWall: { r:2, c:3, ori:'V' } }
    ];

    // ===== HISTÓRICO DO OPONENTE (100 jogadas) =====
    var historicoJogador = [];
    var ultimaPosicaoJogador = null;

    function registrarJogadaJogador() {
        if (!G) return;
        var r = G.pos[0][0];
        var c = G.pos[0][1];
        var turnos = (G.hist && G.hist.length) ? G.hist.length : 0;

        // Detecta se foi movimento ou parede pela última ação em G.hist
        var ultimaAcao = null;
        if (G.hist && G.hist.length > 0) {
            ultimaAcao = G.hist[G.hist.length - 1];
        }

        if (ultimaPosicaoJogador && (ultimaPosicaoJogador[0] !== r || ultimaPosicaoJogador[1] !== c)) {
            historicoJogador.push({ tipo: 'move', r: r, c: c, deR: ultimaPosicaoJogador[0], deC: ultimaPosicaoJogador[1] });
        } else if (ultimaAcao && ultimaAcao.type === 'wall') {
            historicoJogador.push({ tipo: 'wall', r: ultimaAcao.r, c: ultimaAcao.c, ori: ultimaAcao.ori });
        }

        ultimaPosicaoJogador = [r, c];
        if (historicoJogador.length > 100) historicoJogador.shift();
    }

    // ===== DETECÇÃO DE PADRÃO =====
    function detectarPadrao() {
        if (historicoJogador.length < 10) {
            return { tipo: 'inicio', confianca: 0 };
        }

        var janela = historicoJogador.slice(-30);
        var movimentos = janela.filter(function(j){ return j.tipo === 'move'; });
        var paredes = janela.filter(function(j){ return j.tipo === 'wall'; });

        // Coluna preferida
        var somaCol = 0;
        for (var i = 0; i < movimentos.length; i++) somaCol += movimentos[i].c;
        var colMedia = movimentos.length > 0 ? somaCol / movimentos.length : 4;

        // Proporção de paredes
        var propParede = janela.length > 0 ? paredes.length / janela.length : 0;

        // Ritmo (média de turnos entre movimentos)
        // Simplificação: se tem poucas paredes, ritmo é agressivo
        var agressivo = propParede < 0.15;
        var bloqueador = propParede > 0.4;

        // Tendência
        var inicioEsq = colMedia < 3.5;
        var inicioDir = colMedia > 4.5;

        // Padrão dos últimos 10 turnos
        var ultimos10 = historicoJogador.slice(-10);
        var movsU10 = ultimos10.filter(function(j){ return j.tipo === 'move'; });
        var colU10 = 0;
        for (var k = 0; k < movsU10.length; k++) colU10 += movsU10[k].c;
        var colU10Med = movsU10.length > 0 ? colU10 / movsU10.length : 4;

        // Detecta padrão principal
        if (agressivo && colU10Med < 3.5) return { tipo: 'agressivo_esquerda', confianca: 0.8 };
        if (agressivo && colU10Med > 4.5) return { tipo: 'agressivo_direita', confianca: 0.8 };
        if (agressivo && Math.abs(colU10Med - 4) < 1) return { tipo: 'agressivo_centro', confianca: 0.8 };
        if (bloqueador) return { tipo: 'bloqueador', confianca: 0.7 };
        if (inicioEsq) return { tipo: 'esquerda', confianca: 0.6 };
        if (inicioDir) return { tipo: 'direita', confianca: 0.6 };
        return { tipo: 'equilibrado', confianca: 0.4 };
    }

    function aplicarPadrao(perfil, padrao) {
        // Ajusta perfil conforme padrão detectado
        if (padrao.tipo === 'agressivo_esquerda') {
            perfil.pesoParede += 15;
            perfil.agressividade = Math.min(0.95, perfil.agressividade + 0.2);
            perfil._focoLado = 'esquerda';
        } else if (padrao.tipo === 'agressivo_direita') {
            perfil.pesoParede += 15;
            perfil.agressividade = Math.min(0.95, perfil.agressividade + 0.2);
            perfil._focoLado = 'direita';
        } else if (padrao.tipo === 'agressivo_centro') {
            perfil.pesoParede += 20;
            perfil.agressividade = Math.min(0.95, perfil.agressividade + 0.25);
            perfil._focoLado = 'centro';
        } else if (padrao.tipo === 'bloqueador') {
            perfil.pesoParede -= 10;
            perfil.ganhoMinParede = Math.max(2, perfil.ganhoMinParede - 1);
            perfil._focoLado = 'avancar';
        } else if (padrao.tipo === 'esquerda') {
            perfil._focoLado = 'bloquear_esquerda';
        } else if (padrao.tipo === 'direita') {
            perfil._focoLado = 'bloquear_direita';
        }
        return perfil;
    }

    // ===== PERFIS (mesmos 1000) =====
    var PERFIS_EXPERT = window.PERFIS_EXPERT || (function () {
        var lista = [];
        var pesosDiferenca = [150, 165, 180, 195, 210, 225, 240, 250];
        var pesosParede    = [20, 30, 40, 50, 60, 70, 80];
        var agressividades = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
        var ganhosMin      = [2, 3, 4, 5];
        var profundidades  = [2, 3, 4, 5];
        var bonusAvancos   = [20, 30, 40, 50, 60];
        var estilos        = ['centro', 'lateral', 'agressivo', 'defensivo', 'equilibrado'];
        for (var i = 0; i < 1000; i++) {
            lista.push({
                pesoDiferenca: pesosDiferenca[i % pesosDiferenca.length],
                pesoParede: pesosParede[(i * 3) % pesosParede.length],
                agressividade: agressividades[(i * 7) % agressividades.length],
                ganhoMinParede: ganhosMin[(i * 11) % ganhosMin.length],
                profundidadePrevisao: profundidades[(i * 13) % profundidades.length],
                bonusAvanco: bonusAvancos[(i * 17) % bonusAvanos.length],
                estilo: estilos[(i * 19) % estilos.length]
            });
        }
        window.PERFIS_EXPERT = lista;
        return lista;
    })();

    function getPerfilAtual() {
        if (!G._perfilExpert) G._perfilExpert = PERFIS_EXPERT[Math.floor(Math.random() * PERFIS_EXPERT.length)];
        return G._perfilExpert;
    }

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return historicoIA.indexOf(posKey(r, c)) !== -1; }
    function registrarIA(r, c) {
        historicoIA.push(posKey(r, c));
        if (historicoIA.length > 20) historicoIA.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsPath(player, pH, pV, pos) {
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var q = [start];
        var parent = {};
        parent[start[0] + ',' + start[1]] = null;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) {
                var path = [];
                var k = cur[0] + ',' + cur[1];
                while (k !== null) {
                    var parts = k.split(',');
                    path.unshift([parseInt(parts[0], 10), parseInt(parts[1], 10)]);
                    k = parent[k];
                }
                return { dist: path.length - 1, path: path };
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    }

    function bfsDist(player, pH, pV, pos) { return bfsPath(player, pH, pV, pos).dist; }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function oponenteAmeacaEm2(pH, pV, pos, oppIdx) {
        var moves = legalMoves(oppIdx, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) {
            var npos = [pos[0].slice(), pos[1].slice()];
            npos[oppIdx] = [moves[i][0], moves[i][1]];
            if (moves[i][0] === WIN[oppIdx]) return true;
            if (bfsDist(oppIdx, pH, pV, npos) === 1) return true;
        }
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function avaliar(pos, pH, pV, walls, perfil) {
        var p0 = bfsPath(0, pH, pV, pos);
        var p1 = bfsPath(1, pH, pV, pos);
        var d0 = p0.dist, d1 = p1.dist;
        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * perfil.pesoDiferenca;
        score += (walls[1] - walls[0]) * perfil.pesoParede;
        score += pos[1][0] * perfil.bonusAvanco;
        score -= (8 - pos[0][0]) * perfil.bonusAvanco * 0.75;
        if (canWinNext(1, pH, pV, pos)) score += 7000;
        if (canWinNext(0, pH, pV, pos)) score -= 7000;
        if (d1 > d0) score -= (d1 - d0) * 200;
        if (d0 > d1) score += (d0 - d1) * perfil.agressividade * 40;
        if (d0 <= 3) score -= (4 - d0) * 2500;
        return score;
    }

    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (acao.tipo === 'move') npos[cur] = [acao.r, acao.c];
        else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    function paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil) {
        if (walls[iaIdx] <= 0) return [];
        var opp = 1 - iaIdx;
        var caminhoOpp = bfsPath(opp, pH, pV, pos);
        var oppD = caminhoOpp.dist;
        var meuD = bfsDist(iaIdx, pH, pV, pos);
        var celulas = {};
        for (var k = 0; k < caminhoOpp.path.length; k++) celulas[caminhoOpp.path[k][0] + ',' + caminhoOpp.path[k][1]] = true;
        function toca(r, c, ori) {
            if (ori === 'H') return celulas[r + ',' + c] || celulas[(r + 1) + ',' + c];
            return celulas[r + ',' + c] || celulas[r + ',' + (c + 1)];
        }
        var paredes = [];
        var ganhoMin = oppD <= 3 ? 1 : perfil.ganhoMinParede;
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'H')) continue;
                var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                if (gH >= ganhoMin && mgH <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'H', ganho:gH, custo:mgH });
            }
            if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'V')) continue;
                var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                if (gV >= ganhoMin && mgV <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'V', ganho:gV, custo:mgV });
            }
        }
        paredes.sort(function(a, b){ return (b.ganho * 20 - b.custo * 10) - (a.ganho * 20 - a.custo * 10); });
        return paredes.slice(0, 6);
    }

    function escolherAbertura(perfil, padrao) {
        var candidatas = OPENINGS_EXPERT.slice();

        // Ajusta abertura conforme padrão
        if (padrao.tipo === 'agressivo_esquerda') candidatas = candidatas.filter(function(a){ return a.c <= 3 || (a.ori === 'V' && a.c <= 4); });
        else if (padrao.tipo === 'agressivo_direita') candidatas = candidatas.filter(function(a){ return a.c >= 5 || (a.ori === 'V' && a.c >= 4); });
        else if (padrao.tipo === 'agressivo_centro') candidatas = candidatas.filter(function(a){ return Math.abs(a.c - 4) <= 1; });
        else if (padrao.tipo === 'bloqueador') candidatas = candidatas.filter(function(a){ return a.type === 'move'; });

        if (candidatas.length === 0) candidatas = OPENINGS_EXPERT.slice();
        return candidatas[Math.floor(Math.random() * candidatas.length)];
    }

    function decidir() {
        var perfil = getPerfilAtual();
        var padrao = detectarPadrao();
        perfil = aplicarPadrao(perfil, padrao);

        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };

        var oppD = bfsDist(oppIdx, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // 2. Bloqueio obrigatório (oppD == 1)
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var melhorB = null, melhorG = -1;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var gH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var sH = bfsDist(iaIdx, tH, pV, pos) - meuD;
                        if (sH <= 3 && gH > melhorG) { melhorG = gH; melhorB = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var gV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var sV = bfsDist(iaIdx, pH, tV, pos) - meuD;
                        if (sV <= 3 && gV > melhorG) { melhorG = gV; melhorB = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (melhorB) return melhorB;
        }

        // 3. Abertura (primeiro turno)
        if (pH.length === 0 && pV.length === 0 && pos[1][0] === 0 && pos[1][1] === 4) {
            var ab = escolherAbertura(perfil, padrao);
            if (ab) {
                if (ab.type === 'move') {
                    var okA = legalMoves(iaIdx, pH, pV, pos).some(function(m){ return m[0] === ab.r && m[1] === ab.c; });
                    if (okA) return { type:'move', r:ab.r, c:ab.c };
                } else if (podeColocar(ab.r, ab.c, ab.ori, pH, pV, walls[iaIdx], pos)) {
                    return { type:'wall', r:ab.r, c:ab.c, ori:ab.ori };
                }
            }
        }

        // 4. Bloqueio preventivo
        if ((oppD <= 3 || oponenteAmeacaEm2(pH, pV, pos, oppIdx)) && walls[iaIdx] > 0) {
            var paredes = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
            if (paredes.length > 0 && paredes[0].ganho >= 1) {
                return { type:'wall', r:paredes[0].r, c:paredes[0].c, ori:paredes[0].ori };
            }
        }

        // 5. GPS: próximo passo do caminho mínimo
        var rota = bfsPath(iaIdx, pH, pV, pos);
        if (rota.path && rota.path.length > 1) {
            var passoGPS = rota.path[1];
            var moves = legalMoves(iaIdx, pH, pV, pos);
            var valido = moves.some(function(m){ return m[0] === passoGPS[0] && m[1] === passoGPS[1]; });
            if (valido) {
                if (oppD <= 5 && oppD > 3 && walls[iaIdx] > 2) {
                    var paredesMed = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
                    if (paredesMed.length > 0 && paredesMed[0].ganho >= 3) {
                        return { type:'wall', r:paredesMed[0].r, c:paredesMed[0].c, ori:paredesMed[0].ori };
                    }
                }
                return { type:'move', r:passoGPS[0], c:passoGPS[1] };
            }
        }

        // 6. Fallback
        var movesFb = legalMoves(iaIdx, pH, pV, pos);
        if (movesFb.length > 0) return { type:'move', r:movesFb[0][0], c:movesFb[0][1] };
        return null;
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        if (!G._perfilExpert) G._perfilExpert = getPerfilAtual();
        registrarJogadaJogador();
        try {
            var act = decidir();
            if (act && act.type === 'move') registrarIA(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrarIA(fb[0][0], fb[0][1]);
                return { type:'move', r:fb[0][0], c:fb[0][1] };
            }
            return null;
        }
    }

    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) { nextTurn(); return; }
                stopTimer();

                if (act.type === 'move') {
                    var val = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!val) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin(); if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }
                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            checkWin(); if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    if (typeof resetGame === 'function') {
        var _origReset = resetGame;
        window.resetGame = resetGame = function () {
            if (G && G.vsIA) {
                G._perfilExpert = null;
                historicoJogador = [];
                ultimaPosicaoJogador = null;
            }
            return _origReset.apply(this, arguments);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    window.OPENINGS_EXPERT = OPENINGS_EXPERT;
    console.log('IA_EXPERT_100_ABERTURAS_100_HIST ATIVO — aberturas:' + OPENINGS_EXPERT.length);
})();
// ===================== FIM IA_EXPERT_100_ABERTURAS_100_HIST =====================

// ===================== IA_EXPERT_ETAPA1_FIM_DE_JOGO =====================
(function () {
    // Etapa 1: quando ambos têm ≤ 2 paredes, IA para de bloquear e corre direto.
    // Só bloqueia se oponente estiver a 1 da vitória.
    // Esta é uma camada de decisão que envolve a IA Expert atual (GPS + 1000 perfis + 100 aberturas).

    if (typeof window.iaJogarExpert !== 'function') return;
    var _iaExpertBase = window.iaJogarExpert;

    function detectarFimDeJogo() {
        if (!G) return false;
        var paredesJogador = (G.walls && typeof G.walls[0] === 'number') ? G.walls[0] : 10;
        var paredesIA = (G.walls && typeof G.walls[1] === 'number') ? G.walls[1] : 10;
        return (paredesJogador <= 2 && paredesIA <= 2);
    }

    // Helpers locais (não alteram estado global)
    function wallBlockLocal(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMovesLocal(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlockLocal(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlockLocal(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlockLocal(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsDistLocal(player, pH, pV, pos) {
        var WIN = [0, 8];
        var goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMovesLocal(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (seen[key]) continue;
                seen[key] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    function canWinNextLocal(player, pH, pV, pos) {
        var WIN = [0, 8];
        var moves = legalMovesLocal(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    window.iaJogarExpert = function () {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        // Se não for fase final, delega para a IA Expert base (sem alteração)
        if (!detectarFimDeJogo()) {
            return _iaExpertBase.apply(this, arguments);
        }

        // ===== Fase final: comportamento simplificado =====
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMovesLocal(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === 8; });
        if (winMoves.length > 0) {
            return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };
        }

        var oppD = bfsDistLocal(oppIdx, pH, pV, pos);

        // 2. Só bloqueia se oponente está a 1 da vitória
        if (canWinNextLocal(oppIdx, pH, pV, pos) || oppD === 1) {
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (typeof canPlace === 'function' && canPlace(r, c, 'H')) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNextLocal(oppIdx, tH, pV, pos)) {
                        return { type:'wall', r:r, c:c, ori:'H' };
                    }
                }
                if (typeof canPlace === 'function' && canPlace(r, c, 'V')) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNextLocal(oppIdx, pH, tV, pos)) {
                        return { type:'wall', r:r, c:c, ori:'V' };
                    }
                }
            }
        }

        // 3. Correr direto pelo caminho mais curto
        var moves = legalMovesLocal(iaIdx, pH, pV, pos);
        if (moves.length === 0) return null;
        var melhorMov = null, melhorDist = 999;
        for (var i = 0; i < moves.length; i++) {
            var npos = [pos[0].slice(), pos[1].slice()];
            npos[iaIdx] = [moves[i][0], moves[i][1]];
            var d = bfsDistLocal(iaIdx, pH, pV, npos);
            if (d < melhorDist) {
                melhorDist = d;
                melhorMov = { type:'move', r:moves[i][0], c:moves[i][1] };
            }
        }
        return melhorMov;
    };

    console.log('IA_EXPERT_ETAPA1_FIM_DE_JOGO ATIVO');
})();
// ===================== FIM IA_EXPERT_ETAPA1_FIM_DE_JOGO =====================

// ===================== IA_EXPERT_ETAPA2_BLOQUEIO_DUPLO =====================
(function () {
    // Etapa 2: simula 2 plies (IA → oponente → IA) para fechar brechas.
    // Envolve a IA Expert atual sem alterar as etapas anteriores.

    if (typeof window.iaJogarExpert !== 'function') return;
    var _iaExpertBase = window.iaJogarExpert;

    function wallBlockL(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalL(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlockL(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlockL(pH, pV, nr, nc, jr, jc)) out.push([jr, jc]);
                else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlockL(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else out.push([nr, nc]);
        }
        return out;
    }

    function bfsL(player, pH, pV, pos) {
        var WIN = [0, 8], goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalL(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var k = nb[i][0] + ',' + nb[i][1];
                if (seen[k]) continue;
                seen[k] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    function canWinNextL(player, pH, pV, pos) {
        var WIN = [0, 8];
        var m = legalL(player, pH, pV, pos);
        for (var i = 0; i < m.length; i++) if (m[i][0] === WIN[player]) return true;
        return false;
    }

    // Melhor movimento do oponente para chegar ao objetivo
    function melhorMovimentoOponente(pH, pV, pos, oppIdx) {
        var moves = legalL(oppIdx, pH, pV, pos);
        if (moves.length === 0) return null;
        var melhor = null, melhorD = 999;
        for (var i = 0; i < moves.length; i++) {
            var npos = [pos[0].slice(), pos[1].slice()];
            npos[oppIdx] = [moves[i][0], moves[i][1]];
            var d = bfsL(oppIdx, pH, pV, npos);
            if (d < melhorD) {
                melhorD = d;
                melhor = { tipo: 'move', r: moves[i][0], c: moves[i][1], dist: d };
            }
        }
        return melhor;
    }

    // Simula aplicar movimento
    function simMove(pos, r, c, idx) {
        var np = [pos[0].slice(), pos[1].slice()];
        np[idx] = [r, c];
        return np;
    }

    // Simula aplicar parede
    function simWall(pH, pV, walls, r, c, ori, idx) {
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (ori === 'H') npH = pH.concat([[r, c]]);
        else npV = pV.concat([[r, c]]);
        nw[idx]--;
        return { pH: npH, pV: npV, walls: nw };
    }

    // ===== Avaliação de um bloqueio considerando 2 plies =====
    function avaliarBloqueioDuplo(acao, pos, pH, pV, walls, iaIdx, oppIdx) {
        // 1. Simula aplicação da minha ação
        var np = pos, npH = pH, npV = pV, nw = walls;
        if (acao.tipo === 'wall') {
            var sw = simWall(pH, pV, walls, acao.r, acao.c, acao.ori, iaIdx);
            npH = sw.pH; npV = sw.pV; nw = sw.walls;
        } else {
            np = simMove(pos, acao.r, acao.c, iaIdx);
        }

        // 2. Oponente faz o melhor movimento dele
        var oppMove = melhorMovimentoOponente(npH, npV, np, oppIdx);
        if (!oppMove) return -1e15; // oponente travado = ruim para ele, bom para nós

        // 3. Avalia distâncias após a resposta
        var oppDistPos = bfsL(oppIdx, npH, npV, np); // distância do oponente atual
        var minhaDistPos = bfsL(iaIdx, npH, npV, np); // distância da IA atual

        // Se oponente ainda está perto da vitória após meu bloqueio, o bloqueio falhou
        if (oppMove.dist <= 1) return -50000; // oponente vence logo
        if (oppMove.dist <= 2) return -10000; // oponente muito perto

        // Ganho = quanto o oponente ficou atrasado
        var ganhoOponente = oppMove.dist - oppDistPos;

        // Diferença de caminhos
        var diff = oppMove.dist - minhaDistPos;

        return diff * 100 + ganhoOponente * 50;
    }

    window.iaJogarExpert = function () {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        // Chama a base (etapa 1 + IA anterior)
        var acaoBase = _iaExpertBase.apply(this, arguments);
        if (!acaoBase) return null;

        // Só otimiza se for parede (bloqueio) e o oponente está próximo
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        var oppDist = bfsL(oppIdx, pH, pV, pos);
        var meuDist = bfsL(iaIdx, pH, pV, pos);

        // Só ajusta se oponente próximo (≤ 5) e ação base é parede
        if (oppDist > 5 || acaoBase.type !== 'wall') return acaoBase;

        // Compara a ação base com alternativas próximas (mesma categoria)
        var melhorAcao = acaoBase;
        var melhorScore = avaliarBloqueioDuplo(acaoBase, pos, pH, pV, walls, iaIdx, oppIdx);

        // Gera até 12 paredes candidatas para testar
        var candidatas = [];
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (candidatas.length >= 12) break;
                if (typeof canPlace !== 'function') break;
                if (canPlace(r, c, 'H')) {
                    candidatas.push({ type:'wall', r:r, c:c, ori:'H' });
                }
                if (candidatas.length >= 12) break;
                if (canPlace(r, c, 'V')) {
                    candidatas.push({ type:'wall', r:r, c:c, ori:'V' });
                }
            }
            if (candidatas.length >= 12) break;
        }

        for (var i = 0; i < candidatas.length; i++) {
            var cand = candidatas[i];
            var sc = avaliarBloqueioDuplo(cand, pos, pH, pV, walls, iaIdx, oppIdx);
            if (sc > melhorScore) {
                melhorScore = sc;
                melhorAcao = cand;
            }
        }

        return melhorAcao;
    };

    console.log('IA_EXPERT_ETAPA2_BLOQUEIO_DUPLO ATIVO');
})();
// ===================== FIM IA_EXPERT_ETAPA2_BLOQUEIO_DUPLO =====================

// ===================== IA_EXPERT_ETAPA3_GARGALO =====================
(function () {
    // Etapa 3: encontra a parede que bloqueia MÚLTIPLAS rotas do oponente de uma vez.
    // Envolve a IA Expert atual (etapas 1 e 2) sem alterar as anteriores.

    if (typeof window.iaJogarExpert !== 'function') return;
    var _iaExpertBase = window.iaJogarExpert;

    function wallBlockG(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalG(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlockG(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlockG(pH, pV, nr, nc, jr, jc)) out.push([jr, jc]);
                else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlockG(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else out.push([nr, nc]);
        }
        return out;
    }

    // BFS que conta quantos caminhos DIFERENTES de distância mínima existem
    function bfsContaCaminhos(player, pH, pV, pos, limite) {
        var WIN = [0, 8], goal = WIN[player];
        var start = pos[player][0] + ',' + pos[player][1];
        var dist = {}; dist[start] = 0;
        var caminhos = {}; caminhos[start] = 1;
        var q = [[pos[player][0], pos[player][1]]];
        var qi = 0;
        var distFinal = 999;
        while (qi < q.length) {
            var cur = q[qi++];
            var curKey = cur[0] + ',' + cur[1];
            var d = dist[curKey];
            if (d >= distFinal) continue;
            if (cur[0] === goal) {
                distFinal = d;
                continue;
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalG(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var k = nb[i][0] + ',' + nb[i][1];
                var nd = d + 1;
                if (dist[k] === undefined || dist[k] > nd) {
                    dist[k] = nd;
                    caminhos[k] = caminhos[curKey];
                    q.push([nb[i][0], nb[i][1]]);
                } else if (dist[k] === nd) {
                    caminhos[k] = Math.min(limite, (caminhos[k] || 0) + caminhos[curKey]);
                }
            }
        }
        var goalKey = goal + ',' + pos[player][1];
        // Busca caminhos para qualquer célula na linha objetivo
        var total = 0;
        for (var c2 = 0; c2 < 9; c2++) {
            var kk = goal + ',' + c2;
            if (dist[kk] === distFinal && distFinal < 999) {
                total += caminhos[kk] || 0;
            }
        }
        return { dist: distFinal, caminhos: Math.min(limite, total) };
    }

    function bfsDistG(player, pH, pV, pos) {
        return bfsContaCaminhos(player, pH, pV, pos, 1).dist;
    }

    // ===== Avaliação de gargalo =====
    function avaliarGargalo(acao, pos, pH, pV, walls, iaIdx, oppIdx) {
        // Simula a parede
        var npH = pH, npV = pV, nw = walls.slice();
        if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
        else npV = pV.concat([[acao.r, acao.c]]);
        nw[iaIdx]--;

        // Antes e depois: distância e número de caminhos do oponente
        var antes = bfsContaCaminhos(oppIdx, pH, pV, pos, 5);
        var depois = bfsContaCaminhos(oppIdx, npH, npV, pos, 5);

        // Distância da IA depois
        var meuD = bfsDistG(iaIdx, npH, npV, pos);

        // Se bloqueou todos os caminhos, é inválido
        if (depois.dist >= 99) return -1e15;

        // Ganho de distância
        var ganhoDist = depois.dist - antes.dist;

        // Redução de caminhos alternativos (gargalo!)
        var reducaoCaminhos = antes.caminhos - depois.caminhos;

        // Score: distância importa, mas redução de caminhos é ouro
        var score = ganhoDist * 60 + reducaoCaminhos * 200;

        // Bônus se ficar com apenas 1 caminho
        if (depois.caminhos <= 1 && antes.caminhos >= 2) score += 500;

        // Se atrapalhar minha IA, penaliza
        var meuAntes = bfsDistG(iaIdx, pH, pV, pos);
        if (meuD > meuAntes + 1) score -= (meuD - meuAntes) * 120;

        return score;
    }

    window.iaJogarExpert = function () {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        var acaoBase = _iaExpertBase.apply(this, arguments);
        if (!acaoBase) return null;

        // Só otimiza quando a ação for parede
        if (acaoBase.type !== 'wall') return acaoBase;

        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // Só otimiza se oponente está relativamente perto
        var oppDist = bfsDistG(oppIdx, pH, pV, pos);
        if (oppDist > 5) return acaoBase;

        // Compara a base com candidatas
        var melhorAcao = acaoBase;
        var melhorScore = avaliarGargalo(acaoBase, pos, pH, pV, walls, iaIdx, oppIdx);

        // Gera até 20 candidatas
        var cands = [];
        for (var r = 0; r < 8 && cands.length < 20; r++) {
            for (var c = 0; c < 8 && cands.length < 20; c++) {
                if (typeof canPlace !== 'function') break;
                if (canPlace(r, c, 'H')) cands.push({ type:'wall', r:r, c:c, ori:'H' });
                if (cands.length >= 20) break;
                if (canPlace(r, c, 'V')) cands.push({ type:'wall', r:r, c:c, ori:'V' });
            }
        }

        for (var i = 0; i < cands.length; i++) {
            var sc = avaliarGargalo(cands[i], pos, pH, pV, walls, iaIdx, oppIdx);
            if (sc > melhorScore) {
                melhorScore = sc;
                melhorAcao = cands[i];
            }
        }

        return melhorAcao;
    };

    console.log('IA_EXPERT_ETAPA3_GARGALO ATIVO');
})();
// ===================== FIM IA_EXPERT_ETAPA3_GARGALO =====================

// ===================== IA_EXPERT_ETAPA4_PUNIR_PREVISIVEL =====================
(function () {
    // Etapa 4: memoriza as últimas 5 partidas do oponente e adapta comportamento.
    // Se o oponente repete a abertura, a IA antecipa o bloqueio.

    if (typeof window.iaJogarExpert !== 'function') return;
    var _iaExpertBase = window.iaJogarExpert;

    // ===== MEMÓRIA (localStorage por nickname) =====
    function getChaveMemoria() {
        var nick = (typeof currentUser === 'string' && currentUser) ? currentUser : 'anon';
        return 'quoridor_ia_mem_' + nick.toLowerCase();
    }

    function lerMemoria() {
        try {
            var raw = localStorage.getItem(getChaveMemoria());
            if (!raw) return { aberturas: [], paredesPreferidas: [], total: 0 };
            return JSON.parse(raw);
        } catch (e) {
            return { aberturas: [], paredesPreferidas: [], total: 0 };
        }
    }

    function salvarMemoria(mem) {
        try {
            localStorage.setItem(getChaveMemoria(), JSON.stringify(mem));
        } catch (e) {}
    }

    // Chamado quando o jogador faz a primeira jogada de uma partida
    var aberturaRegistrada = false;

    function registrarAberturaAtual() {
        if (aberturaRegistrada) return;
        if (!G || !G.pos) return;
        // Só registra quando o humano já se moveu pelo menos 1 vez
        var r = G.pos[0][0];
        var c = G.pos[0][1];
        if (r === 8 && c === 4) return; // posição inicial, ainda não se moveu
        var mem = lerMemoria();
        var chave = r + ',' + c;
        mem.aberturas.push(chave);
        if (mem.aberturas.length > 5) mem.aberturas.shift();
        mem.total = (mem.total || 0) + 1;
        salvarMemoria(mem);
        aberturaRegistrada = true;
    }

    // Detecta se o jogador tem abertura previsível
    function aberturaPrevisivel() {
        var mem = lerMemoria();
        if (!mem.aberturas || mem.aberturas.length < 3) return null;
        // Conta repetições
        var contagem = {};
        for (var i = 0; i < mem.aberturas.length; i++) {
            contagem[mem.aberturas[i]] = (contagem[mem.aberturas[i]] || 0) + 1;
        }
        // Se alguma abertura apareceu em 3+ das últimas 5 partidas, é previsível
        for (var k in contagem) {
            if (contagem[k] >= 3) {
                var parts = k.split(',');
                return { r: parseInt(parts[0], 10), c: parseInt(parts[1], 10), repeticoes: contagem[k] };
            }
        }
        return null;
    }

    // ===== HELPERS LOCAIS =====
    function wallBlockP(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalP(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlockP(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlockP(pH, pV, nr, nc, jr, jc)) out.push([jr, jc]);
                else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlockP(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else out.push([nr, nc]);
        }
        return out;
    }

    function bfsP(player, pH, pV, pos) {
        var WIN = [0, 8], goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalP(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var k = nb[i][0] + ',' + nb[i][1];
                if (seen[k]) continue;
                seen[k] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    // ===== ANTECIPAÇÃO =====
    function acharBloqueioAntecipado(previsao, pH, pV, walls, pos) {
        // previsao = { r, c } a casa que o jogador costuma ir
        if (!previsao) return null;
        var alvo = [previsao.r, previsao.c];
        var candidatas = [];
        // Paredes que bloqueiam o caminho para essa casa
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (typeof canPlace !== 'function') break;
                if (canPlace(r, c, 'H')) {
                    var npH = pH.concat([[r, c]]);
                    var novaDist = bfsP(0, npH, pV, pos);
                    if (novaDist > bfsP(0, pH, pV, pos)) {
                        // Verifica se atrapalha a IA
                        var minhaAntes = bfsP(1, pH, pV, pos);
                        var minhaDepois = bfsP(1, npH, pV, pos);
                        if (minhaDepois <= minhaAntes) {
                            candidatas.push({ type:'wall', r:r, c:c, ori:'H', ganho: novaDist - bfsP(0, pH, pV, pos) });
                        }
                    }
                }
                if (canPlace(r, c, 'V')) {
                    var npV = pV.concat([[r, c]]);
                    var novaDistV = bfsP(0, pH, npV, pos);
                    if (novaDistV > bfsP(0, pH, pV, pos)) {
                        var minhaAntesV = bfsP(1, pH, pV, pos);
                        var minhaDepoisV = bfsP(1, pH, npV, pos);
                        if (minhaDepoisV <= minhaAntesV) {
                            candidatas.push({ type:'wall', r:r, c:c, ori:'V', ganho: novaDistV - bfsP(0, pH, pV, pos) });
                        }
                    }
                }
            }
        }
        candidatas.sort(function(a, b){ return b.ganho - a.ganho; });
        return candidatas.length > 0 ? candidatas[0] : null;
    }

    // ===== WRAPPER FINAL =====
    window.iaJogarExpert = function () {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        // Registra a abertura do jogador (uma vez por partida)
        registrarAberturaAtual();

        // Se o jogador é previsível, e ainda estamos no início, antecipa o bloqueio
        var previsao = aberturaPrevisivel();
        if (previsao && G.hist && G.hist.length >= 2) {
            var pos = [G.pos[0].slice(), G.pos[1].slice()];
            var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
            var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
            var walls = [G.walls[0], G.walls[1]];

            // Só antecipa se ainda tiver paredes
            if (walls[1] > 2) {
                var bloqueio = acharBloqueioAntecipado(previsao, pH, pV, walls, pos);
                if (bloqueio) {
                    return bloqueio;
                }
            }
        }

        // Caso contrário, delega para as etapas anteriores
        return _iaExpertBase.apply(this, arguments);
    };

    // Reset da flag quando a partida reinicia
    if (typeof resetGame === 'function') {
        var _origReset4 = resetGame;
        window.resetGame = resetGame = function () {
            aberturaRegistrada = false;
            return _origReset4.apply(this, arguments);
        };
    }

    console.log('IA_EXPERT_ETAPA4_PUNIR_PREVISIVEL ATIVO');
})();
// ===================== FIM IA_EXPERT_ETAPA4_PUNIR_PREVISIVEL =====================

// ===================== IA_EXPERT_CONSOLIDADA_FINAL =====================
(function () {
    var WIN = [0, 8];
    var BFS_CACHE = {};
    var COMPLEXIDADE_LIMITE = 400; // ms

    // ===== MEMÓRIA ENTRE PARTIDAS =====
    function chaveEstilo() {
        var nick = (typeof currentUser === 'string' && currentUser) ? currentUser : 'anon';
        return 'quoridor_estilo_' + nick.toLowerCase();
    }
    function lerEstilo() {
        try {
            var raw = localStorage.getItem(chaveEstilo());
            if (!raw) return { partidas: 0, mediaParedes: 5, estilo: 'equilibrado' };
            return JSON.parse(raw);
        } catch (e) { return { partidas: 0, mediaParedes: 5, estilo: 'equilibrado' }; }
    }
    function salvarEstilo(e) {
        try { localStorage.setItem(chaveEstilo(), JSON.stringify(e)); } catch (err) {}
    }

    // ===== HISTÓRICO DE 20 JOGADAS =====
    var memJogadas = [];
    var ultPosHum = null;
    var ultPHS = 0, ultPVS = 0;

    function registrarHumano() {
        if (!G || !G.pos) return;
        var r = G.pos[0][0], c = G.pos[0][1];
        if (ultPosHum && (ultPosHum[0] !== r || ultPosHum[1] !== c)) {
            memJogadas.push({ tipo: 'move', deR: ultPosHum[0], deC: ultPosHum[1], r: r, c: c });
            if (memJogadas.length > 20) memJogadas.shift();
        }
        var pHs = G.pH ? G.pH.length : 0;
        var pVs = G.pV ? G.pV.length : 0;
        if (pHs > ultPHS && G.pH.length > 0) {
            memJogadas.push({ tipo: 'wall', r: G.pH[G.pH.length-1][0], c: G.pH[G.pH.length-1][1], ori: 'H' });
            if (memJogadas.length > 20) memJogadas.shift();
        } else if (pVs > ultPVS && G.pV.length > 0) {
            memJogadas.push({ tipo: 'wall', r: G.pV[G.pV.length-1][0], c: G.pV[G.pV.length-1][1], ori: 'V' });
            if (memJogadas.length > 20) memJogadas.shift();
        }
        ultPosHum = [r, c];
        ultPHS = pHs;
        ultPVS = pVs;
    }

    function analisarPadroes() {
        if (memJogadas.length < 4) return null;
        var movs = memJogadas.filter(function(j){ return j.tipo === 'move'; });
        var paredes = memJogadas.filter(function(j){ return j.tipo === 'wall'; });
        var somaC = 0;
        for (var i = 0; i < movs.length; i++) somaC += movs[i].c;
        var colMedia = movs.length > 0 ? somaC / movs.length : 4;
        var contPos = {};
        for (var i = 0; i < movs.length; i++) {
            var k = movs[i].r + ',' + movs[i].c;
            contPos[k] = (contPos[k] || 0) + 1;
        }
        var cicloDetectado = false;
        for (var k in contPos) if (contPos[k] >= 3) cicloDetectado = true;
        var taxaParede = memJogadas.length > 0 ? paredes.length / memJogadas.length : 0;
        return { colMedia: colMedia, ciclo: cicloDetectado, taxaParede: taxaParede, totalMovs: movs.length };
    }

    // ===== HELPERS BFS =====
    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) out.push([jr, jc]);
                else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else out.push([nr, nc]);
        }
        return out;
    }

    function bfsKey(player, pH, pV, pos) {
        var k = player + '|' + pos[0][0] + ',' + pos[0][1] + '|' + pos[1][0] + ',' + pos[1][1] + '|';
        for (var i = 0; i < pH.length; i++) k += pH[i][0] + ',' + pH[i][1] + ';';
        k += '|';
        for (var i = 0; i < pV.length; i++) k += pV[i][0] + ',' + pV[i][1] + ';';
        return k;
    }

    function bfsInfo(player, pH, pV, pos, contCaminhos) {
        var cacheKey = bfsKey(player, pH, pV, pos) + (contCaminhos ? '|c' : '|d');
        if (BFS_CACHE[cacheKey]) return BFS_CACHE[cacheKey];

        var goal = WIN[player];
        var startKey = pos[player][0] + ',' + pos[player][1];
        var dist = {}; dist[startKey] = 0;
        var cam = {}; cam[startKey] = 1;
        var q = [[pos[player][0], pos[player][1]]];
        var qi = 0;
        var distFinal = 999;
        while (qi < q.length) {
            var cur = q[qi++];
            var curKey = cur[0] + ',' + cur[1];
            var d = dist[curKey];
            if (d >= distFinal) continue;
            if (cur[0] === goal) { distFinal = d; continue; }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var k = nb[i][0] + ',' + nb[i][1];
                var nd = d + 1;
                if (dist[k] === undefined || dist[k] > nd) {
                    dist[k] = nd;
                    cam[k] = cam[curKey];
                    q.push([nb[i][0], nb[i][1]]);
                } else if (dist[k] === nd) {
                    cam[k] = Math.min(5, (cam[k] || 0) + cam[curKey]);
                }
            }
        }
        var total = 0;
        for (var c2 = 0; c2 < 9; c2++) {
            var kk = goal + ',' + c2;
            if (dist[kk] === distFinal && distFinal < 999) total += cam[kk] || 0;
        }
        var res = { dist: distFinal, caminhos: Math.min(5, total) };
        BFS_CACHE[cacheKey] = res;
        return res;
    }

    function bfsDist(player, pH, pV, pos) { return bfsInfo(player, pH, pV, pos, false).dist; }

    function canWinNext(player, pH, pV, pos) {
        var m = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < m.length; i++) if (m[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    // ===== MAPA DE CALOR (novo) =====
    function mapaDeCalor(player, pH, pV, pos) {
        var goal = WIN[player];
        var heat = {};
        for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) heat[r+','+c] = 0;
        var inicio = pos[player].slice();
        var q = [[inicio[0], inicio[1], 0]];
        var dist = {}; dist[inicio[0]+','+inicio[1]] = 0;
        var qi = 0;
        var distFinal = 999;
        while (qi < q.length) {
            var cur = q[qi++];
            var k = cur[0] + ',' + cur[1];
            if (cur[0] === goal) { distFinal = Math.min(distFinal, cur[2]); continue; }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var nk = nb[i][0] + ',' + nb[i][1];
                if (dist[nk] === undefined) {
                    dist[nk] = cur[2] + 1;
                    q.push([nb[i][0], nb[i][1], cur[2] + 1]);
                }
            }
        }
        for (var kk in dist) {
            if (dist[kk] < distFinal) heat[kk] = (heat[kk] || 0) + 1;
        }
        return heat;
    }

    // ===== PREVISÃO DE 2 JOGADAS DO OPONENTE (novo) =====
    function preverDuasJogadas(pH, pV, pos, oppIdx) {
        var m1 = legalMoves(oppIdx, pH, pV, pos);
        if (m1.length === 0) return null;
        var melhor1 = null, d1 = 999;
        for (var i = 0; i < m1.length; i++) {
            var np = [pos[0].slice(), pos[1].slice()];
            np[oppIdx] = [m1[i][0], m1[i][1]];
            var dd = bfsDist(oppIdx, pH, pV, np);
            if (dd < d1) { d1 = dd; melhor1 = [m1[i][0], m1[i][1]]; }
        }
        if (!melhor1) return null;
        var np2 = [pos[0].slice(), pos[1].slice()];
        np2[oppIdx] = melhor1;
        var m2 = legalMoves(oppIdx, pH, pV, np2);
        var melhor2 = null, d2 = 999;
        for (var i = 0; i < m2.length; i++) {
            var np3 = [np2[0].slice(), np2[1].slice()];
            np3[oppIdx] = [m2[i][0], m2[i][1]];
            var dd2 = bfsDist(oppIdx, pH, pV, np3);
            if (dd2 < d2) { d2 = dd2; melhor2 = [m2[i][0], m2[i][1]]; }
        }
        return { primeira: melhor1, segunda: melhor2, distFinal: d2 };
    }

    // ===== GERAÇÃO DE CANDIDATOS (limitada para performance) =====
    function gerarCandidatos(pos, pH, pV, walls, iaIdx, limite) {
        var cands = [];
        var opp = 1 - iaIdx;
        var oppD = bfsDist(opp, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);
        var heat = mapaDeCalor(opp, pH, pV, pos);
        var caminhoOpp = null;
        var rota = bfsInfo(opp, pH, pV, pos, false);
        for (var r = 0; r < 8 && cands.length < limite; r++) {
            for (var c = 0; c < 8 && cands.length < limite; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    var gH = bfsDist(opp, tH, pV, pos) - oppD;
                    var mgH = bfsDist(iaIdx, tH, pV, pos) - meuD;
                    if (gH >= 1 && mgH <= 1) {
                        var heatH = (heat[(r)+','+(c)] || 0) + (heat[(r+1)+','+(c)] || 0);
                        cands.push({ tipo: 'wall', r: r, c: c, ori: 'H', ganho: gH, custo: mgH, heat: heatH });
                    }
                }
                if (cands.length >= limite) break;
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    var gV = bfsDist(opp, pH, tV, pos) - oppD;
                    var mgV = bfsDist(iaIdx, pH, tV, pos) - meuD;
                    if (gV >= 1 && mgV <= 1) {
                        var heatV = (heat[(r)+','+(c)] || 0) + (heat[(r)+','+(c+1)] || 0);
                        cands.push({ tipo: 'wall', r: r, c: c, ori: 'V', ganho: gV, custo: mgV, heat: heatV });
                    }
                }
            }
        }
        cands.sort(function (a, b) {
            var sa = a.ganho * 20 + a.heat * 5 - a.custo * 15;
            var sb = b.ganho * 20 + b.heat * 5 - b.custo * 15;
            return sb - sa;
        });
        return cands;
    }

    // ===== ESCOLHA DA AÇÃO =====
    function escolherAcao() {
        var t0 = Date.now();
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type: 'move', r: winMoves[0][0], c: winMoves[0][1] };

        var oppD = bfsDist(oppIdx, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // 2. Bloqueio obrigatório (oppD == 1)
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) return { type: 'wall', r: r, c: c, ori: 'H' };
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) return { type: 'wall', r: r, c: c, ori: 'V' };
                }
            }
        }

        // 3. Fim de jogo (ambos com poucas paredes): correr direto
        if (walls[0] <= 2 && walls[1] <= 2) {
            var moves = legalMoves(iaIdx, pH, pV, pos);
            var melhor = null, md = 999;
            for (var i = 0; i < moves.length; i++) {
                var np = [pos[0].slice(), pos[1].slice()];
                np[iaIdx] = [moves[i][0], moves[i][1]];
                var dd = bfsDist(iaIdx, pH, pV, np);
                if (dd < md) { md = dd; melhor = moves[i]; }
            }
            if (melhor) return { type: 'move', r: melhor[0], c: melhor[1] };
        }

        // 4. Previsão de 2 jogadas
        var previsao = preverDuasJogadas(pH, pV, pos, oppIdx);
        if (previsao && previsao.distFinal <= 2 && walls[iaIdx] > 0) {
            var bloqueio = gerarCandidatos(pos, pH, pV, walls, iaIdx, 6);
            if (bloqueio.length > 0) {
                return { type: 'wall', r: bloqueio[0].r, c: bloqueio[0].c, ori: bloqueio[0].ori };
            }
        }

        // 5. Aplicar padrão do jogador
        var padrao = analisarPadroes();
        if (padrao && padrao.ciclo && walls[iaIdx] > 2) {
            var blk = gerarCandidatos(pos, pH, pV, walls, iaIdx, 4);
            if (blk.length > 0 && blk[0].ganho >= 2) {
                return { type: 'wall', r: blk[0].r, c: blk[0].c, ori: blk[0].ori };
            }
        }

        // 6. Se oponente próximo, bloqueio com análise de gargalo
        if (oppD <= 4 && walls[iaIdx] > 0) {
            var cands = gerarCandidatos(pos, pH, pV, walls, iaIdx, 8);
            if (cands.length > 0 && cands[0].ganho >= 2) {
                return { type: 'wall', r: cands[0].r, c: cands[0].c, ori: cands[0].ori };
            }
        }

        // 7. GPS: próximo passo do caminho mais curto
        var movs = legalMoves(iaIdx, pH, pV, pos);
        if (movs.length === 0) return null;

        var melhorMov = null, melhorDist = 999, melhorRotas = 0;
        for (var i = 0; i < movs.length; i++) {
            var np2 = [pos[0].slice(), pos[1].slice()];
            np2[iaIdx] = [movs[i][0], movs[i][1]];
            var info = bfsInfo(iaIdx, pH, pV, np2, true);
            var score = -info.dist * 100 + info.caminhos * 20;
            if (score > (melhorMov ? -melhorDist * 100 + melhorRotas * 20 : -99999)) {
                melhorDist = info.dist;
                melhorRotas = info.caminhos;
                melhorMov = movs[i];
            }
        }

        if (melhorMov && Date.now() - t0 < COMPLEXIDADE_LIMITE) {
            return { type: 'move', r: melhorMov[0], c: melhorMov[1] };
        }

        // 8. Fallback
        if (movs.length > 0) return { type: 'move', r: movs[0][0], c: movs[0][1] };
        return null;
    }

    // ===== FUNÇÃO PRINCIPAL =====
    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        registrarHumano();

        try {
            var acao = escolherAcao();
            return acao;
        } catch (e) {
            console.error('Erro IA:', e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length > 0) return { type: 'move', r: fb[0][0], c: fb[0][1] };
            return null;
        }
    }

    // Substitui global
    window.iaJogarExpert = iaJogarExpert;

    // Reset no início da partida
    if (typeof resetGame === 'function') {
        var _origResetC = resetGame;
        window.resetGame = resetGame = function () {
            memJogadas = [];
            ultPosHum = null;
            ultPHS = 0;
            ultPVS = 0;
            BFS_CACHE = {};
            return _origResetC.apply(this, arguments);
        };
    }

    console.log('IA_EXPERT_CONSOLIDADA_FINAL ATIVO');
})();
// ===================== FIM IA_EXPERT_CONSOLIDADA_FINAL =====================

// ===================== IA_EXPERT_MELHORIAS_EXTRA =====================
(function () {
    // Camada única com 8 melhorias novas. Delega para a base quando não se aplica.

    if (typeof window.iaJogarExpert !== 'function') return;
    var _base = window.iaJogarExpert;

    var WIN = [0, 8];

    // ===== MEMÓRIA DE PARTIDAS =====
    function chaveHistoricoDerrotas() {
        var nick = (typeof currentUser === 'string' && currentUser) ? currentUser : 'anon';
        return 'quoridor_derrotas_' + nick.toLowerCase();
    }
    function lerDerrotas() {
        try {
            var raw = localStorage.getItem(chaveHistoricoDerrotas());
            return raw ? JSON.parse(raw) : { aberturas: [], total: 0 };
        } catch (e) { return { aberturas: [], total: 0 }; }
    }
    function salvarDerrotas(d) {
        try { localStorage.setItem(chaveHistoricoDerrotas(), JSON.stringify(d)); } catch (e) {}
    }

    // ===== UTILITÁRIOS =====
    function wb(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1-c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i=0;i<pV.length;i++) if (pV[i][1]===cMin && (pV[i][0]===r1||pV[i][0]===r1-1)) return true;
        }
        if (c1 === c2 && Math.abs(r1-r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i=0;i<pH.length;i++) if (pH[i][0]===rMin && (pH[i][1]===c1||pH[i][1]===c1-1)) return true;
        }
        return false;
    }

    function lm(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1-player];
        var dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        var out = [];
        for (var i=0;i<4;i++) {
            var nr = r+dirs[i][0], nc = c+dirs[i][1];
            if (nr<0||nr>8||nc<0||nc>8) continue;
            if (wb(pH, pV, r, c, nr, nc)) continue;
            if (nr===other[0] && nc===other[1]) {
                var dr = nr-r, dc = nc-c, jr = nr+dr, jc = nc+dc;
                if (jr>=0&&jr<=8&&jc>=0&&jc<=8&&!wb(pH,pV,nr,nc,jr,jc)) out.push([jr,jc]);
                else {
                    var sides = dr!==0 ? [[nr,nc-1],[nr,nc+1]] : [[nr-1,nc],[nr+1,nc]];
                    for (var s=0;s<2;s++) if (sides[s][0]>=0&&sides[s][0]<=8&&sides[s][1]>=0&&sides[s][1]<=8&&!wb(pH,pV,nr,nc,sides[s][0],sides[s][1])) out.push(sides[s]);
                }
            } else out.push([nr,nc]);
        }
        return out;
    }

    function bfs(player, pH, pV, pos) {
        var goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0]+','+pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = lm(player, pH, pV, tpos);
            for (var i=0;i<nb.length;i++) {
                var k = nb[i][0]+','+nb[i][1];
                if (seen[k]) continue;
                seen[k] = 1;
                q.push([nb[i][0], nb[i][1], cur[2]+1]);
            }
        }
        return 99;
    }

    function podeColocar(r, c, ori, pH, pV, wl, pos) {
        if (wl<=0 || r<0 || r>=8 || c<0 || c>=8) return false;
        if (ori === 'H') {
            for (var i=0;i<pH.length;i++) {
                if (pH[i][0]===r && pH[i][1]===c) return false;
                if (pH[i][0]===r && (pH[i][1]===c-1||pH[i][1]===c+1)) return false;
            }
            for (var i=0;i<pV.length;i++) if (pV[i][1]===c && pV[i][0]===r) return false;
            return bfs(0, pH.concat([[r,c]]), pV, pos) < 99 && bfs(1, pH.concat([[r,c]]), pV, pos) < 99;
        }
        for (var i=0;i<pV.length;i++) {
            if (pV[i][0]===r && pV[i][1]===c) return false;
            if (pV[i][1]===c && (pV[i][0]===r-1||pV[i][0]===r+1)) return false;
        }
        for (var i=0;i<pH.length;i++) if (pH[i][0]===r && pH[i][1]===c) return false;
        return bfs(0, pH, pV.concat([[r,c]]), pos) < 99 && bfs(1, pH, pV.concat([[r,c]]), pos) < 99;
    }

    // ===== MELHORIA 1: Zona morta (caminho muito longo = perdida) =====
    function emZonaMorta(pH, pV, pos) {
        var d1 = bfs(1, pH, pV, pos);
        return d1 >= 14;
    }

    function recuperarZonaMorta(pH, pV, pos) {
        // Se está com caminho enorme, tenta quebrar bloqueio do oponente
        var wl = G.walls[1];
        if (wl <= 0) return null;
        var cand = null, maiorGanho = 0;
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (podeColocar(r, c, 'H', pH, pV, wl, pos)) {
                var tH = pH.concat([[r, c]]);
                var g = bfs(1, pH, pV, pos) - bfs(1, tH, pV, pos);
                if (g > maiorGanho) { maiorGanho = g; cand = { type:'wall', r:r, c:c, ori:'H' }; }
            }
            if (podeColocar(r, c, 'V', pH, pV, wl, pos)) {
                var tV = pV.concat([[r, c]]);
                var gV = bfs(1, pH, pV, pos) - bfs(1, pH, tV, pos);
                if (gV > maiorGanho) { maiorGanho = gV; cand = { type:'wall', r:r, c:c, ori:'V' }; }
            }
        }
        return maiorGanho >= 2 ? cand : null;
    }

    // ===== MELHORIA 2: Reserva dinâmica de paredes =====
    function reservaDinamica(pH, pV, pos) {
        var d0 = bfs(0, pH, pV, pos);
        var d1 = bfs(1, pH, pV, pos);
        // Início (oponente longe): guarda 4
        if (d0 >= 6 && d1 <= 4) return 4;
        // Meio: guarda 3
        if (d0 >= 4) return 3;
        // Final: guarda 0
        return 0;
    }

    // ===== MELHORIA 3: Mapa de estrangulamento =====
    function casasEstrangulamento(player, pH, pV, pos) {
        // Casas por onde TODOS os caminhos mínimos passam
        var contagem = {};
        for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) contagem[r+','+c] = 0;
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var dist = {}; dist[start[0]+','+start[1]] = 0;
        var q = [[start[0], start[1]]];
        var qi = 0;
        var distFinal = 999;
        while (qi < q.length) {
            var cur = q[qi++];
            var k = cur[0]+','+cur[1];
            if (cur[0] === goal) { distFinal = Math.min(distFinal, dist[k]); continue; }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = lm(player, pH, pV, tpos);
            for (var i=0;i<nb.length;i++) {
                var nk = nb[i][0]+','+nb[i][1];
                if (dist[nk] === undefined) {
                    dist[nk] = dist[k]+1;
                    q.push([nb[i][0], nb[i][1]]);
                }
            }
        }
        for (var kk in dist) {
            if (dist[kk] < distFinal) contagem[kk]++;
        }
        return contagem;
    }

    // ===== MELHORIA 4: Simulação de sequência dupla de paredes =====
    function bloqueioDuploEfetivo(pH, pV, pos, iaIdx) {
        var wl = G.walls[iaIdx];
        if (wl < 2) return null;
        var opp = 1 - iaIdx;
        var dOppAntes = bfs(opp, pH, pV, pos);
        var melhor = null, melhorGanho = 0;
        // Tenta cada parede + segunda parede
        var lim1 = 0;
        for (var r1 = 0; r1 < 8 && lim1 < 8; r1++) {
            for (var c1 = 0; c1 < 8 && lim1 < 8; c1++) {
                if (podeColocar(r1, c1, 'H', pH, pV, wl, pos)) {
                    var pH2 = pH.concat([[r1, c1]]);
                    var dH1 = bfs(opp, pH2, pV, pos);
                    var ganho1 = dH1 - dOppAntes;
                    if (ganho1 >= 1) {
                        // Tenta uma segunda parede
                        for (var r2 = 0; r2 < 8; r2 += 2) {
                            for (var c2 = 0; c2 < 8; c2 += 2) {
                                if (podeColocar(r2, c2, 'V', pH2, pV, wl - 1, pos)) {
                                    var pV2 = pV.concat([[r2, c2]]);
                                    var dTotal = bfs(opp, pH2, pV2, pos);
                                    var ganhoTotal = dTotal - dOppAntes;
                                    if (ganhoTotal > melhorGanho) {
                                        melhorGanho = ganhoTotal;
                                        melhor = { type:'wall', r:r1, c:c1, ori:'H', ganho:ganhoTotal };
                                    }
                                }
                            }
                        }
                    }
                }
                lim1++;
            }
        }
        return melhorGanho >= 5 ? melhor : null;
    }

    // ===== MELHORIA 5: Antecipação de salto =====
    function anteciparSalto(pH, pV, pos) {
        var r1 = pos[1][0], c1 = pos[1][1];
        var r0 = pos[0][0], c0 = pos[0][1];
        // Se estão adjacentes
        var adj = (Math.abs(r1-r0) + Math.abs(c1-c0)) === 1;
        if (!adj) return null;
        // Oponente pode saltar 2 casas? Simular
        var dr = r0 - r1, dc = c0 - c1;
        var jr = r0 + dr, jc = c0 + dc;
        if (jr < 0 || jr > 8 || jc < 0 || jc > 8) return null;
        // Verificar se o salto é legal
        if (wb(pH, pV, r0, c0, jr, jc)) return null;
        // O salto é possível: bloquear atrás
        return { r: r0, c: c0, jr: jr, jc: jc };
    }

    // ===== MELHORIA 6: Sinal de pânico do oponente =====
    function oponenteEmPanico() {
        if (!G.hist) return false;
        var ultimas = G.hist.slice(-6);
        var paredesOpp = 0;
        for (var i = 0; i < ultimas.length; i++) {
            if (ultimas[i].type === 'wall' && ultimas[i].turn === 0) paredesOpp++;
        }
        return paredesOpp >= 3;
    }

    // ===== MELHORIA 7: Análise de relógio =====
    function analisarRelogio() {
        if (!G || !G.clock) return 'neutro';
        var tempo = G.clock;
        // Se IA tem muito tempo e oponente pouco, IA pode ser paciente
        // Se IA tem pouco tempo, IA precisa ser agressiva
        if (currentTime < config.time * 0.3) return 'urgente';
        return 'neutro';
    }

    // ===== MELHORIA 8: Simulação do pior caso =====
    function piorRespostaPossivel(pH, pV, pos, oppIdx) {
        var moves = lm(oppIdx, pH, pV, pos);
        var piorD = 999;
        for (var i = 0; i < moves.length; i++) {
            var np = [pos[0].slice(), pos[1].slice()];
            np[oppIdx] = [moves[i][0], moves[i][1]];
            var d = bfs(oppIdx, pH, pV, np);
            if (d < piorD) piorD = d;
        }
        return piorD;
    }

    // ===== WRAPPER FINAL =====
    window.iaJogarExpert = function () {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winM = lm(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winM.length > 0) return { type:'move', r:winM[0][0], c:winM[0][1] };

        var d0 = bfs(oppIdx, pH, pV, pos);
        var d1 = bfs(iaIdx, pH, pV, pos);

        // 2. Bloqueio obrigatório
        if (d0 === 1) {
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (bfs(oppIdx, tH, pV, pos) > 1) return { type:'wall', r:r, c:c, ori:'H' };
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (bfs(oppIdx, pH, tV, pos) > 1) return { type:'wall', r:r, c:c, ori:'V' };
                }
            }
        }

        // 3. Zona morta: recuperar
        if (emZonaMorta(pH, pV, pos)) {
            var rec = recuperarZonaMorta(pH, pV, pos);
            if (rec) return rec;
        }

        // 4. Antecipar salto: bloquear atrás
        var salto = anteciparSalto(pH, pV, pos);
        if (salto && d0 <= 3 && walls[iaIdx] > 1) {
            // Tenta colocar parede atrás do oponente
            var rA = salto.r, cA = salto.c;
            // Candidatos: paredes ao redor da casa atual
            var possiveis = [
                { r: rA, c: cA, ori: 'H' },
                { r: rA-1, c: cA, ori: 'H' },
                { r: rA, c: cA, ori: 'V' },
                { r: rA, c: cA-1, ori: 'V' }
            ];
            for (var k = 0; k < possiveis.length; k++) {
                var p = possiveis[k];
                if (p.r >= 0 && p.r < 8 && p.c >= 0 && p.c < 8) {
                    if (podeColocar(p.r, p.c, p.ori, pH, pV, walls[iaIdx], pos)) {
                        return { type:'wall', r:p.r, c:p.c, ori:p.ori };
                    }
                }
            }
        }

        // 5. Bloqueio duplo quando oponente está muito perto
        if (d0 <= 2 && walls[iaIdx] >= 2) {
            var duplo = bloqueioDuploEfetivo(pH, pV, pos, iaIdx);
            if (duplo) return duplo;
        }

        // 6. Reserva dinâmica: não gastar além da reserva
        var reserva = reservaDinamica(pH, pV, pos);
        var podeGastar = walls[iaIdx] > reserva;

        // 7. Oponente em pânico: parar de bloquear e correr
        if (oponenteEmPanico() && d0 >= 4) {
            var movs = lm(iaIdx, pH, pV, pos);
            var melhorCorrida = null, menorD = 999;
            for (var i = 0; i < movs.length; i++) {
                var np = [pos[0].slice(), pos[1].slice()];
                np[iaIdx] = [movs[i][0], movs[i][1]];
                var dd = bfs(iaIdx, pH, pV, np);
                if (dd < menorD) { menorD = dd; melhorCorrida = movs[i]; }
            }
            if (melhorCorrida) return { type:'move', r:melhorCorrida[0], c:melhorCorrida[1] };
        }

        // 8. Bloqueio preventivo com estrangulamento
        if (d0 <= 5 && podeGastar) {
            var estrang = casasEstrangulamento(oppIdx, pH, pV, pos);
            var melhorWall = null, melhorScore = 0;
            for (var r2 = 0; r2 < 8; r2++) for (var c2 = 0; c2 < 8; c2++) {
                if (podeColocar(r2, c2, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH2 = pH.concat([[r2, c2]]);
                    var ganhoH = bfs(oppIdx, tH2, pV, pos) - d0;
                    var custoH = bfs(iaIdx, tH2, pV, pos) - d1;
                    if (ganhoH > 0 && custoH <= 1) {
                        var heatH = (estrang[r2+','+c2] || 0) + (estrang[(r2+1)+','+c2] || 0);
                        var scH = ganhoH * 20 + heatH * 3 - custoH * 10;
                        if (scH > melhorScore) { melhorScore = scH; melhorWall = { type:'wall', r:r2, c:c2, ori:'H' }; }
                    }
                }
                if (podeColocar(r2, c2, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV2 = pV.concat([[r2, c2]]);
                    var ganhoV = bfs(oppIdx, pH, tV2, pos) - d0;
                    var custoV = bfs(iaIdx, pH, tV2, pos) - d1;
                    if (ganhoV > 0 && custoV <= 1) {
                        var heatV = (estrang[r2+','+c2] || 0) + (estrang[r2+','+(c2+1)] || 0);
                        var scV = ganhoV * 20 + heatV * 3 - custoV * 10;
                        if (scV > melhorScore) { melhorScore = scV; melhorWall = { type:'wall', r:r2, c:c2, ori:'V' }; }
                    }
                }
            }
            if (melhorWall && melhorScore >= 25) return melhorWall;
        }

        // 9. Delega para a IA consolidada
        return _base.apply(this, arguments);
    };

    // Reset no início da partida
    if (typeof resetGame === 'function') {
        var _origResetX = resetGame;
        window.resetGame = resetGame = function () {
            return _origResetX.apply(this, arguments);
        };
    }

    console.log('IA_EXPERT_MELHORIAS_EXTRA ATIVO');
})();
// ===================== FIM IA_EXPERT_MELHORIAS_EXTRA =====================

// =====================================================================
// WORKER DO CEREBROIA — roda a IA em thread separada (UI livre)
// =====================================================================
var _iaWorker = null;
var _iaWorkerPronto = false;
var _iaWorkerCallback = null;
var _iaWorkerIdCounter = 0;
var _iaWorkerFallbackTimer = null;

(function () {
    if (typeof Worker === 'undefined') {
        console.warn('[Worker] Web Workers não suportados neste navegador');
        return;
    }

    try {
        _iaWorker = new Worker('ia_worker.js');

        _iaWorker.onmessage = function (e) {
            var dados = e.data;
            if (!dados) return;

            if (dados.tipo === 'pronto') {
                _iaWorkerPronto = true;
                console.log('[Worker] CerebroIA pronto ✅');
                return;
            }

            if (dados.tipo === 'jogada') {
                if (_iaWorkerFallbackTimer) {
                    clearTimeout(_iaWorkerFallbackTimer);
                    _iaWorkerFallbackTimer = null;
                }
                if (_iaWorkerCallback) {
                    var cb = _iaWorkerCallback;
                    _iaWorkerCallback = null;
                    cb(dados.acao);
                }
            } else if (dados.tipo === 'erro') {
                console.error('[Worker] Erro:', dados.mensagem);
                if (_iaWorkerCallback) {
                    var cb2 = _iaWorkerCallback;
                    _iaWorkerCallback = null;
                    cb2(null);
                }
            }
        };

        _iaWorker.onerror = function (err) {
            console.error('[Worker] Erro geral:', err);
        };
    } catch (e) {
        console.warn('[Worker] Falha ao criar Worker:', e);
    }
})();

function _enviarParaWorker(pos, pH, pV, walls, iaIdx, callback) {
    // Fallback: se worker não estiver disponível, usa o antigo jogarAsync
    if (!_iaWorker || !_iaWorkerPronto) {
        if (window.CerebroIA && typeof window.CerebroIA.jogarAsync === 'function') {
            window.CerebroIA.jogarAsync(pos, pH, pV, walls, iaIdx, callback);
        } else {
            callback(null);
        }
        return;
    }

    _iaWorkerIdCounter++;
    var id = _iaWorkerIdCounter;
    _iaWorkerCallback = callback;

    // Fallback de segurança: se o worker demorar >30s, delega pra jogarAsync
    if (_iaWorkerFallbackTimer) clearTimeout(_iaWorkerFallbackTimer);
    _iaWorkerFallbackTimer = setTimeout(function () {
        console.warn('[Worker] Timeout — usando fallback jogarAsync');
        if (_iaWorkerCallback) {
            var cb = _iaWorkerCallback;
            _iaWorkerCallback = null;
            if (window.CerebroIA && typeof window.CerebroIA.jogarAsync === 'function') {
                window.CerebroIA.jogarAsync(pos, pH, pV, walls, iaIdx, cb);
            } else {
                cb(null);
            }
        }
    }, 30000);

    _iaWorker.postMessage({
        tipo: 'jogar',
        pos: pos,
        pH: pH,
        pV: pV,
        walls: walls,
        iaIdx: iaIdx,
        id: id
    });
}

// =====================================================================
// FASE E — Integração do CerebroIA (nova IA Expert)
// =====================================================================
// Este bloco substitui o scheduleIA para usar a nova IA (CerebroIA)
// quando disponível. Se CerebroIA não existir ou falhar, delega para
// a implementação original (as 17 camadas antigas).
//
// Para desativar: apague este bloco e o jogo volta a usar a IA antiga.
// =====================================================================
(function () {
    if (typeof window.CerebroIA !== 'object') {
        console.log('[FaseE] CerebroIA não encontrado — mantendo IA antiga');
        return;
    }
    if (typeof window.scheduleIA !== 'function') {
        console.log('[FaseE] scheduleIA não encontrado — abortando integração');
        return;
    }

    var _scheduleIAOriginal = window.scheduleIA;

    // Substitui scheduleIA
    window.scheduleIA = function () {
        // Mesmas guardas da versão original
        if (G.iaThinking || G.over || !gameActive || matchFinished) return;
        if (!G.vsIA || G.turn !== 1) return;
        var _self = this;
        var _args = arguments;

        setIAThinking(true);
        setTimeout(function () {
            if (G.over || G.turn !== 1 || !gameActive || matchFinished) {
                setIAThinking(false);
                return;
            }

            // Envia estado pro Worker (thread separada — UI livre)
            _enviarParaWorker(G.pos, G.pH, G.pV, [G.walls[0], G.walls[1]], 1, function (acao) {
                if (!acao) {
                    setIAThinking(false);
                    return _scheduleIAOriginal.apply(_self, _args);
                }

                setIAThinking(false);
                stopTimer();

                if (acao.type === 'move') {
                    if (typeof doMove === 'function') {
                        doMove(acao.r, acao.c);
                    } else {
                        G.pos[1] = [acao.r, acao.c];
                        checkWin();
                        if (!G.over) nextTurn();
                        updateWallIndicators(); draw();
                    }
                } else if (acao.type === 'wall') {
                    if (typeof placeWall === 'function') {
                        placeWall(acao.r + 1, acao.c + 1, acao.ori);
                    } else {
                        G.walls[1]--;
                        if (acao.ori === 'H') {
                            G.pH.push([acao.r, acao.c]);
                            if (G.wallOwnerH) G.wallOwnerH.push(1);
                        } else {
                            G.pV.push([acao.r, acao.c]);
                            if (G.wallOwnerV) G.wallOwnerV.push(1);
                        }
                        checkWin();
                        if (!G.over) nextTurn();
                        updateWallIndicators(); draw();
                    }
                } else {
                    return _scheduleIAOriginal.apply(_self, _args);
                }
            });
        }, 300);
    };

    // Envolve resetGame para resetar personalidade no início de cada partida
    if (typeof window.resetGame === 'function') {
        var _resetGameOriginal = window.resetGame;
        window.resetGame = function () {
            try {
                if (window.CerebroIA && typeof window.CerebroIA.resetarPersonalidade === 'function') {
                    window.CerebroIA.resetarPersonalidade();
                }
            } catch (e) {
                console.warn('[FaseE] Erro ao resetar personalidade:', e);
            }
            return _resetGameOriginal.apply(this, arguments);
        };
    }

    console.log('[FaseE] CerebroIA integrado com sucesso ✅');
})();

// =====================================================================
// FASE E.2 — Registro de jogadas do humano para o CerebroIA
// =====================================================================
// Envolve doMove e placeWall para que cada jogada do humano seja
// registrada na memória de padrões do CerebroIA. Assim a IA aprende
// o estilo do jogador (onde ele coloca paredes) e pune repetições.
// =====================================================================
(function () {
    if (typeof window.CerebroIA !== 'object') return;
    if (typeof window.CerebroIA._registrarJogada !== 'function') return;

    // Envolve doMove
    if (typeof window.doMove === 'function') {
        var _doMoveOriginal = window.doMove;
        window.doMove = function (r, c) {
            // Registra ANTES de aplicar (o humano está fazendo essa jogada)
            // Só registra se for turno do humano (índice 0)
            try {
                if (typeof G !== 'undefined' && G.turn === 0 && !G.over) {
                    window.CerebroIA._registrarJogada(0, { tipo: 'move', r: r, c: c });
                }
            } catch (e) {}
            return _doMoveOriginal.apply(this, arguments);
        };
    }

    // Envolve placeWall
    if (typeof window.placeWall === 'function') {
        var _placeWallOriginal = window.placeWall;
        window.placeWall = function (ni, nj, ori) {
            // placeWall do jogo é 1-indexed (ni, nj). CerebroIA usa 0-indexed.
            try {
                if (typeof G !== 'undefined' && G.turn === 0 && !G.over) {
                    window.CerebroIA._registrarJogada(0, {
                        tipo: 'wall',
                        r: ni - 1,  // converte de 1-indexed pra 0-indexed
                        c: nj - 1,
                        ori: ori
                    });
                }
            } catch (e) {}
            return _placeWallOriginal.apply(this, arguments);
        };
    }

    console.log('[FaseE.2] Registro de jogadas ativo ✅');
})();

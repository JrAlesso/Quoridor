
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
      if (playerIndex === 0 && currentUser) {
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
      } else if (playerIndex === 1 && G.vsIA) {
        data = [
          { label: 'Nome', value: name },
          { label: 'Tipo', value: 'Inteligência Artificial' },
          { label: 'Dificuldade', value: G.nivelIA.toUpperCase() }
        ];
      } else {
        data = [
          { label: 'Nome', value: name },
          { label: 'Tipo', value: 'Jogador Local' },
          { label: 'Título', value: 'Nenhum' }
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

    function calcularXP(winner, playerIndex, wallsPlaced, moveCount, timeLeft, timeTotal, streak) {
      var base = winner === playerIndex ? 50 : 20;
      var bonusWall = wallsPlaced === 0 ? 15 : wallsPlaced <= 2 ? 10 : wallsPlaced <= 5 ? 5 : 0;
      var bonusMove = moveCount <= 10 ? 15 : Math.max(0, 15 - (moveCount - 10) * 2);
      var bonusTime = timeLeft > timeTotal * 0.5 ? 10 : 0;
      var bonusStreak = streak >= 10 ? 20 : streak >= 5 ? 10 : streak >= 2 ? 5 : 0;
      if (winner !== playerIndex) {
        bonusWall = Math.min(bonusWall, 5);
        bonusMove = Math.min(bonusMove, 5);
        bonusTime = 0;
        bonusStreak = 0;
      }
      return base + bonusWall + bonusMove + bonusTime + bonusStreak;
    }

    function aplicarXP(stats, xp) {
      stats.xp = (stats.xp || 0) + xp;
      while (stats.level < 100 && stats.xp >= xpParaProximoNivel(stats.level)) {
        stats.xp -= xpParaProximoNivel(stats.level);
        stats.level++;
      }
      if (stats.level >= 100) stats.xp = Math.min(stats.xp, xpParaProximoNivel(100));
      return stats;
    }

    function calcularPontosPartida(winner, playerIndex, wallsPlaced, moveCount, totalRounds, timeLeft, timeTotal, streak) {
      if (playerIndex !== winner) {
        var penalty = -5;
        if (wallsPlaced >= 5) penalty -= 2;
        if (moveCount >= 20) penalty -= 2;
        if (streak >= 3) penalty -= 2;
        if (timeLeft < timeTotal * 0.5) penalty -= 1;
        return Math.max(-15, penalty);
      }
      var base = 15;
      var bonusMove = moveCount <= 10 ? 6 : Math.max(0, 6 - (moveCount - 10) * 0.5);
      var bonusWall = wallsPlaced === 0 ? 4 : wallsPlaced <= 2 ? 3 : wallsPlaced <= 5 ? 2 : 0;
      var bonusStreak = streak >= 10 ? 5 : streak >= 5 ? 3 : streak >= 2 ? 2 : 0;
      var bonusTime = timeLeft > timeTotal * 0.5 ? 3 : 0;
      return Math.min(35, Math.round((base + bonusMove + bonusWall + bonusStreak + bonusTime) * 10) / 10);
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
      if (!currentUser) return;
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
      var blockadeBonus = mob1 <= 2 ? 400 : mob1 <= 3 ? 200 : 0;
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
      var minGain = playerCenter ? 1 : 2;
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
      var cfg = {depth: 14, mistakes: 0, wallLimit: 500, timeLimit: 3500};
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
        case 'expert': return {depth:14, wallChance:1.0, mistakes:0.0, wallLimit:500, timeLimit:3500};
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
            var oldRank = getRank(stats.rankPoints);
            stats.games++;
            if (!G.vsIA) stats.localGames = (stats.localGames || 0) + 1;
            if (winner === 0) {
              stats.wins++;
              if (G.vsIA && G.nivelIA === 'expert') stats.expertWins = (stats.expertWins || 0) + 1;
              stats.streak = (stats.streak || 0) + 1;
              stats.maxStreak = Math.max(stats.maxStreak || 0, stats.streak);
            } else {
              stats.losses++;
              stats.streak = 0;
            }
            stats.totalWalls += seriesStats.userWalls;
            stats.totalTurns += seriesStats.userMoves;
            var pts = calcularPontosPartida(winner,0,seriesStats.userWalls,seriesStats.userMoves,config.rounds,currentTime,config.time,stats.streak);
            var xpGanho = calcularXP(winner, 0, seriesStats.userWalls, seriesStats.userMoves, currentTime, config.time, stats.streak);
            stats = aplicarXP(stats, xpGanho);
            if (winner === 0) stats.sumPointsVictories = (stats.sumPointsVictories || 0) + pts;
            stats.rankPoints += pts;
            stats.rankPoints = Math.max(0, stats.rankPoints);
            stats.rankPoints = Math.round(stats.rankPoints * 100) / 100;
            stats.maxRankPoints = Math.max(stats.maxRankPoints, stats.rankPoints);
            if (G.vsIA) {
              var eloIA = {facil:500,medio:800,dificil:1200,expert:1600}[G.nivelIA] || 800;
              stats.opponentEloSum = (stats.opponentEloSum || 0) + eloIA;
              stats.opponentCount = (stats.opponentCount || 0) + 1;
            }
            if (!stats.history) stats.history = [];
            stats.history.unshift({date:Date.now(), mode:G.vsIA?'vs IA':'2 Jogadores', result:winner===0?'Vitória':'Derrota', points:pts, walls:seriesStats.userWalls, moves:seriesStats.userMoves, rounds:config.rounds, time:config.time, xp:xpGanho});
            if (stats.history.length > 100) stats.history.pop();
            saveStats(stats);
            if (currentUser) updateRankDisplay(currentUser);
            var newRank = getRank(stats.rankPoints);
            var vencedorFinal = scores[0] > scores[1] ? G.p1Name : scores[1] > scores[0] ? G.p2Name : 'Empate';
            var msgFinal = '◈ FIM DE JOGO!<span class="sub">' + vencedorFinal + ' venceu (' + scores[0] + ' x ' + scores[1] + ')</span>';
            msgFinal += '<div class="xp-line">+XP ' + xpGanho + '</div>';
            if (pts >= 0) msgFinal += '<div class="rank-line rank-positivo">🟢 +' + pts.toFixed(1) + ' pontos de patente</div>';
            else msgFinal += '<div class="rank-line rank-negativo">🔴 ' + pts.toFixed(1) + ' pontos de patente</div>';
            msgFinal += '<div class="level-line">Nível ' + stats.level + ' (XP: ' + stats.xp + '/' + xpParaProximoNivel(stats.level) + ')</div>';
            if (oldRank !== newRank) msgFinal += '<div class="patent-line"><span class="rank-up">' + oldRank + ' → ' + newRank + '</span></div>';
            else msgFinal += '<div class="patent-line">' + newRank + '</div>';
            document.getElementById('win-message').innerHTML = msgFinal;
            document.getElementById('btn-close-win').style.display = 'block';
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
      var delay = 1600 + (G.nivelIA === 'facil' ? 0 : G.nivelIA === 'medio' ? 400 : G.nivelIA === 'dificil' ? 800 : 1300);
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
    document.getElementById('btn-ranking').addEventListener('click', function(){ alert('Classificação em breve!'); });
    document.getElementById('btn-titulos').addEventListener('click', openTitles);
    document.getElementById('btn-medalhas').addEventListener('click', openMedals);
    document.getElementById('btn-trofeus').addEventListener('click', function(){ alert('Troféus em breve!'); });
    document.getElementById('btn-amigos').addEventListener('click', function(){ alert('Amigos em breve!'); });
    document.getElementById('btn-skins').addEventListener('click', openSkins);
    document.getElementById('btn-claim').addEventListener('click', function() {
      alert('Recompensa coletada! +200 pontos');
      var stats = getUserStats(currentUser);
      stats.points = (stats.points || 0) + 200;
      updateUserStats(currentUser, stats);
      document.getElementById('btn-claim').textContent = '✓ Coletado';
      document.getElementById('btn-claim').disabled = true;
      document.getElementById('btn-claim').style.opacity = '0.6';
    });
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

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Post = require('./models/Post');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    await Category.deleteMany({});
    await Post.deleteMany({});

    const categories = await Category.insertMany([
      { name: 'Tecnologia', slug: 'tecnologia' },
      { name: 'Node.js', slug: 'nodejs' },
      { name: 'JavaScript', slug: 'javascript' },
      { name: 'Backend', slug: 'backend' }
    ]);

    const technology = categories.find((category) => category.slug === 'tecnologia');
    const node = categories.find((category) => category.slug === 'nodejs');
    const js = categories.find((category) => category.slug === 'javascript');
    const backend = categories.find((category) => category.slug === 'backend');

    const posts = [
      {
        slug: 'introducao-ao-nodejs',
        title: 'Introdução ao Node.js',
        description: 'Aprenda os fundamentos do Node.js e como ele funciona no backend.',
        category: technology._id,
        date: '2026-08-17',
        readTime: '5 min',
        tags: ['node', 'backend'],
        content: 'Conteúdo de exemplo para o post sobre Node.js.'
      },
      {
        slug: 'javascript-assincrono',
        title: 'JavaScript Assíncrono',
        description: 'Entenda promises, async/await e fluxo assíncrono em JavaScript.',
        category: js._id,
        date: '2026-08-16',
        readTime: '6 min',
        tags: ['javascript', 'async'],
        content: 'Conteúdo de exemplo para o post sobre JavaScript assíncrono.'
      },
      {
        slug: 'apis-rest-com-express',
        title: 'APIs REST com Express',
        description: 'Construa sua API REST com Express.js e MongoDB.',
        category: backend._id,
        date: '2026-08-15',
        readTime: '8 min',
        tags: ['express', 'api'],
        content: 'Conteúdo de exemplo para o post sobre APIs REST.'
      },
      {
        slug: 'nodejs-e-mongodb',
        title: 'Node.js e MongoDB',
        description: 'Conecte sua aplicação Node.js ao MongoDB de maneira simples.',
        category: node._id,
        date: '2026-08-14',
        readTime: '7 min',
        tags: ['mongodb', 'node'],
        content: 'Conteúdo de exemplo para o post sobre Node.js e MongoDB.'
      }
    ];

    await Post.insertMany(posts);

    console.log('Seed executado com sucesso.');
    console.log('Categorias:', categories.length);
    console.log('Posts:', posts.length);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Erro ao executar seed:', error.message);
    process.exit(1);
  }
};

seedData();

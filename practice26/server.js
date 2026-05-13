import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
    type Author {
        id: ID!
        name: String!
        email: String!
        books: [Book!]!
    }

    type Book {
        id: ID!
        title: String!
        description: String!
        author: Author!
    }

    type Query {
        authors: [Author!]!
        books: [Book!]!
        book(id: ID!): Book
    }

    type Mutation {
        createAuthor(name: String!, email: String!): Author!
        createBook(title: String!, description: String!, authorId: ID!): Book!
    }
`;

const authors = [
    { id: '1', name: 'Джоан Роулинг', email: 'rowling@gmail.com' },
    { id: '2', name: 'Джордж Мартин', email: 'martin@gmail.com' },
];

const books = [
    { id: '1', title: 'Гарри Поттер и философский камень', description: '11-летний мальчик узнаёт о своём магическом происхождении, поступает в Хогвартс и сталкивается с тёмным волшебником Волан-де-Мортом.', authorId: '1'},
    { id: '2', title: 'Гарри Поттер и Дары Смерти', description: 'Гарри и его друзья сражаются с Волан-де-Мортом и его сторонниками, чтобы спасти мир магии.', authorId: '1' },
    { id: '3', title: 'Песнь льда и пламени', description: 'Фэнтези-сага о борьбе великих домов за Железный трон и надвигающейся угрозы белых ходоков.', authorId: '2' },
];

const resolvers = {
    Query: {
        authors: () => authors,
        books: () => books,
        book: (_, { id }) => books.find(b => b.id === id),
    },
    Mutation: {
        createAuthor: (_, { name, email }) => {
            const author = { id: String(authors.length + 1), name, email };
            authors.push(author);
            return author;
        },
        createBook: (_, { title, description, authorId }) => {
            const book = { id: String(books.length + 1), title, description,
            authorId };
            books.push(book);
            return book;
        },
    },
    Author: {
        books: (parent) => books.filter(b => b.authorId === parent.id),
    },
    Book: {
        author: (parent) => authors.find(a => a.id === parent.authorId),
    },
};

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
console.log(`GraphQL Server ready at: ${url}`);
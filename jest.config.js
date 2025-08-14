module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,js}',  // Inclui todos os arquivos .ts e .js dentro de src/
    '!src/**/*.spec.ts', // Exclui arquivos de teste
    '!src/**/main.ts',   // Exclui o arquivo de inicialização, que geralmente não é testado
    '!src/**/*.module.ts',// Exclui módulos, que são apenas contêineres de dependência
  ],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};
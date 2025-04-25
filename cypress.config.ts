import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "angular",  
      bundler: "webpack",    
    },
    specPattern: 'cypress/component/**/*.cy.ts',
  },

  e2e: {
    baseUrl: 'http://localhost:4200', 
    setupNodeEvents(on, config) {
      
    },
    specPattern: 'cypress/e2e/**/*.cy.ts', 
  },
});


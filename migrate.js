#!/usr/bin/env node

/**
 * Script para executar migrations do banco de dados manualmente
 * 
 * Uso:
 *   node migrate.js                  - Executa todas as migrations
 *   node migrate.js --list           - Lista todas as tabelas existentes
 *   node migrate.js --check [table]  - Verifica se uma tabela existe
 */

require('dotenv').config();
const DatabaseMigrations = require('./src/config/migrations');
const pool = require('./src/config/database');

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param = args[1];

    console.log('🚀 Academy Z - Database Migrations\n');

    try {
        // Testar conexão
        await pool.query('SELECT 1');
        console.log('✅ Conexão com banco de dados estabelecida\n');

        if (command === '--list') {
            // Listar todas as tabelas
            console.log('📋 Listando tabelas existentes...\n');
            const tables = await DatabaseMigrations.listTables();
            
            if (tables.length === 0) {
                console.log('⚠️  Nenhuma tabela encontrada no banco de dados');
            } else {
                console.log('Tabelas encontradas:');
                tables.forEach((table, index) => {
                    console.log(`  ${index + 1}. ${table}`);
                });
                console.log(`\nTotal: ${tables.length} tabela(s)`);
            }

        } else if (command === '--check') {
            // Verificar se uma tabela existe
            if (!param) {
                console.error('❌ Erro: Nome da tabela não fornecido');
                console.log('Uso: node migrate.js --check [nome_da_tabela]');
                process.exit(1);
            }

            console.log(`🔍 Verificando tabela "${param}"...\n`);
            const exists = await DatabaseMigrations.tableExists(param);
            
            if (exists) {
                console.log(`✅ A tabela "${param}" existe no banco de dados`);
            } else {
                console.log(`❌ A tabela "${param}" NÃO existe no banco de dados`);
            }

        } else if (command === '--help' || command === '-h') {
            // Exibir ajuda
            console.log('Uso: node migrate.js [comando] [parâmetros]\n');
            console.log('Comandos disponíveis:');
            console.log('  (sem comando)           Executa todas as migrations');
            console.log('  --list                  Lista todas as tabelas existentes');
            console.log('  --check [tabela]        Verifica se uma tabela existe');
            console.log('  --help, -h              Exibe esta ajuda\n');
            console.log('Exemplos:');
            console.log('  node migrate.js');
            console.log('  node migrate.js --list');
            console.log('  node migrate.js --check users');

        } else {
            // Executar todas as migrations
            console.log('🔄 Executando todas as migrations...\n');
            await DatabaseMigrations.runAll();
            console.log('\n✅ Migrations concluídas com sucesso!');
            console.log('📊 Para ver as tabelas criadas, execute: node migrate.js --list');
        }

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Erro ao executar migrations:', error.message);
        console.error('\nDetalhes do erro:', error.stack);
        
        await pool.end();
        process.exit(1);
    }
}

// Executar script
main();

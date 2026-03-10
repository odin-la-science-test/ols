/**
 * Script de test pour l'envoi d'emails
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:3001';

async function testEmailSending() {
    console.log('🧪 Test d\'envoi d\'email...\n');

    try {
        // Test 1: Vérifier que le serveur est en ligne
        console.log('1️⃣ Vérification du serveur...');
        const healthResponse = await axios.get(`${SERVER_URL}/api/health`);
        console.log('✅ Serveur en ligne:', healthResponse.data);
        console.log('');

        // Test 2: Envoyer un email de test
        console.log('2️⃣ Envoi d\'un email de test...');
        const testEmail = process.argv[2] || 'test@example.com';
        const testCode = Math.floor(100000 + Math.random() * 900000).toString();

        console.log(`📧 Destinataire: ${testEmail}`);
        console.log(`🔢 Code: ${testCode}`);
        console.log('');

        const emailResponse = await axios.post(`${SERVER_URL}/api/send-verification-code`, {
            email: testEmail,
            code: testCode
        });

        console.log('✅ Email envoyé avec succès !');
        console.log('📬 Message ID:', emailResponse.data.messageId);
        console.log('');
        console.log('🎉 Test réussi ! Vérifiez votre boîte email.');

    } catch (error) {
        console.error('❌ Erreur lors du test:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Erreur:', error.response.data);
        } else if (error.request) {
            console.error('Le serveur ne répond pas. Assurez-vous qu\'il est démarré.');
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

// Exécuter le test
testEmailSending();

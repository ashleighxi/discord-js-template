const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const wordList = require('../wordlist.json'); // You'll need your own wordlist

module.exports = {
    register_command: new SlashCommandBuilder()
        .setName('wordle')
        .setDescription('Starts a new Wordle-like game'),

    async execute(client, interaction) {
        const channel = interaction.channel; 
        const gameStarter = interaction.user;

        // Choose a random word
        const answer = wordList[Math.floor(Math.random() * wordList.length)];

        // Initial game display
        let currentGuess = "";
        const guesses = [];

        const gameEmbed = new EmbedBuilder()
            .setColor(0x0099FF)  // Or any color you prefer  
            .setTitle('Wordle Game')
            .setDescription('You have 6 guesses.');

        await interaction.reply({ embeds: [gameEmbed] });

        // Filter for guesses, accepts only from the original player
        const filter = (m) => m.author.id === gameStarter.id;
        const collector = channel.createMessageCollector({ filter, time: 600000 /* 10 minutes */ });

        collector.on('collect', async (message) => {
            const guess = message.content.toLowerCase();

            // Basic input validation 
            if (guess.length !== 5 || !wordList.includes(guess)) {
                await message.reply('Invalid word. Please try again.');
                return;
            }

            // Process the guess
            currentGuess += guess + "\n";
            guesses.push(guess);

            gameEmbed.spliceFields(0, guesses.length); // Clear old guesses
            for (let i = 0; i < guesses.length; i++) {
                gameEmbed.addFields({ name: `Guess ${i + 1}`, value: getGuessResult(guesses[i], answer) });
            }

            await interaction.editReply({ embeds: [gameEmbed] });

            // Check for win/loss
            if (guess === answer) {
                collector.stop('win');
                await interaction.followUp(`${gameStarter.username} wins! 🎉`);
            } else if (guesses.length >= 6) {
                collector.stop('loss');
                await interaction.followUp(`You lose! The word was ${answer}`);
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                interaction.followUp(`Time's up! The word was ${answer}`);
            }
        });
    },
};

// Helper for displaying guess results
function getGuessResult(guess, answer) {
    let result = '';
    for (let i = 0; i < 5; i++) {
        if (answer[i] === guess[i]) {
            result += '🟩'; 
        } else if (answer.includes(guess[i])) {
            result += '🟨';
        } else {
            result += '⬛';
        }
    }
    return result;
}
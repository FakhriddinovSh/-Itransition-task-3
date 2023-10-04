import crypto from "crypto"
import readline from "readline"

import chalk from 'chalk';

class MoveTable {
    constructor(moves) {
      this.moves = moves;
      this.table = this.generateTable();
    }
  
    generateTable() {
      const n = this.moves.length;
      const table = [[chalk.bold('v PC\\User >').blue].concat(this.moves.map(move => chalk.bold(move).blue))];
  
      for (let i = 0; i < n; i++) {
        const row = [chalk.bold(this.moves[i]).blue];
        for (let j = 0; j < n; j++) {
          const result = this.determineWinner(i, j, n);
          row.push(this.formatResult(result));
        }
        table.push(row);
      }
  
      return table;
    }
  
    determineWinner(playerMove, computerMove, n) {
      const diff = (computerMove - playerMove + n) % n;
      if (diff === 0) return chalk.gray('Draw');
      return diff <= n / 2 ? chalk.green('Win') : chalk.red('Lose');
    }
  
    formatResult(result) {
      return result;
    }
  
    printTable() {
      console.log('Results are from the user\'s point of view. Example:');
      console.log(this.table.map(row => row.join('\t')).join('\n'));
    }
  }

class GameRules {
  static determineWinner(playerMove, computerMove, moves) {
    const n = moves.length;
    const diff = (computerMove - playerMove + n) % n;
    if (diff === 0) return 'Draw';
    return diff <= n / 2 ? 'Win' : 'Lose';
  }
}

class KeyGenerator {
  static generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

class HMACGenerator {
  static generateHMAC(key, message) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(message);
    return hmac.digest('hex');
  }
}

class Game {
    constructor(moves) {
      this.moves = moves;
      this.moveTable = new MoveTable(moves);
      this.keyGenerator = KeyGenerator;
      this.hmacGenerator = HMACGenerator;
      this.key = this.keyGenerator.generateKey();
      this.computerMove = this.getRandomMove();
    }
  
    getRandomMove() {
      return Math.floor(Math.random() * this.moves.length);
    }
  
    playGame(playerMove) {
      const hmac = this.hmacGenerator.generateHMAC(this.key, this.moves[playerMove]);
      console.log(`HMAC: ${hmac}`);
      console.log('Available moves:');
      this.moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
      console.log('0 - exit');
      console.log('? - help');
  
      const result = GameRules.determineWinner(this.computerMove, playerMove, this.moves);
      console.log(`Your move: ${this.moves[playerMove]}`);
      console.log(`Computer move: ${this.moves[this.computerMove]}`);
      console.log(result === 'Draw' ? 'It\'s a draw!' : `You ${result.toLowerCase()}!`);
      console.log(`HMAC key: ${this.key}`);
    }
  }

// Example usage
const moves = process.argv.slice(2);

const helpTable = new MoveTable(moves);
helpTable.printTable();

if (moves.length < 3 || moves.length % 2 === 0 || new Set(moves).size !== moves.length) {
  console.error('Invalid input. Please provide an odd number of non-repeating moves.');
  console.error('Example: node game.js rock paper scissors');
  process.exit(1);
}

const game = new Game(moves);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Enter your move:');
moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));

rl.question('> ', (answer) => {
  const playerMove = parseInt(answer);

  if (isNaN(playerMove) || playerMove < 1 || playerMove > moves.length) {
    console.error('Invalid input. Please enter a valid move.');
    process.exit(1);
  }

  game.playGame(playerMove - 1);
  rl.close();
});

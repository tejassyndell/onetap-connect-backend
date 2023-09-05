
function generatePassword() {
  const specialCharacters = '!@#$%^&*()_-+=<>?/[]{}|';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  const allCharacters = specialCharacters + lowercaseLetters + uppercaseLetters + numbers;

  let password = '';

  // Ensure at least one character from each category
  password += getRandomChar(specialCharacters);
  password += getRandomChar(lowercaseLetters);
  password += getRandomChar(uppercaseLetters);
  password += getRandomChar(numbers)
;

  // Generate the rest of the password
  const minLength = 8;
  const maxLength = 15;
  const remainingLength = getRandomInt(minLength - 4, maxLength - 4);
  for (let i = 0; i < remainingLength; i++) {
    password += getRandomChar(allCharacters);
  }

  // Shuffle the password characters to randomize the order
  password = shuffleString(password);

  return password;
}

function getRandomChar(characters) {
  const index = getRandomInt(0, characters.length - 1);
  return characters.charAt(index);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleString(str) {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}

// Usage example:


module.exports = generatePassword
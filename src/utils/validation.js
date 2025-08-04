// Validation functions for hundeprøve system

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateParticipantNumber = (number) => {
  // Format: xxxx (4 digits)
  const regex = /^\d{4}$/;
  return regex.test(number);
};

export const validateDogNumber = (number) => {
  // Format: Dkxxxxx/xxxx (Dk followed by 5 digits, slash, 4 digits)
  const regex = /^Dk\d{5}\/\d{4}$/;
  return regex.test(number);
};

export const validateScore = (score) => {
  const numScore = parseInt(score);
  return !isNaN(numScore) && numScore >= 0 && numScore <= 20;
};

export const validatePostNumber = (postNumber, maxPosts) => {
  const numPost = parseInt(postNumber);
  return !isNaN(numPost) && numPost >= 1 && numPost <= maxPosts;
};

export const validateRequiredField = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateTrialName = (name) => {
  return name && name.trim().length >= 3;
};

export const validateDate = (date) => {
  if (!date) return false;
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

// Form validation helpers
export const getValidationErrors = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && !validateRequiredField(value)) {
      errors[field] = `${rule.label} er påkrævet`;
      return;
    }
    
    if (value && rule.type) {
      let isValid = true;
      let errorMessage = '';
      
      switch (rule.type) {
        case 'email':
          isValid = validateEmail(value);
          errorMessage = 'Ugyldig email adresse';
          break;
        case 'participantNumber':
          isValid = validateParticipantNumber(value);
          errorMessage = 'Deltager nummer skal være 4 cifre (f.eks. 0001)';
          break;
        case 'dogNumber':
          isValid = validateDogNumber(value);
          errorMessage = 'Hunde nummer skal være i format Dkxxxxx/xxxx';
          break;
        case 'score':
          isValid = validateScore(value);
          errorMessage = 'Point skal være mellem 0 og 20';
          break;
        case 'password':
          isValid = validatePassword(value);
          errorMessage = 'Adgangskode skal være mindst 6 tegn';
          break;
        case 'name':
          isValid = validateName(value);
          errorMessage = 'Navn skal være mindst 2 tegn';
          break;
        case 'date':
          isValid = validateDate(value);
          errorMessage = 'Dato skal være i dag eller fremtidigt';
          break;
        default:
          break;
      }
      
      if (!isValid) {
        errors[field] = errorMessage;
      }
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${rule.label} skal være mindst ${rule.minLength} tegn`;
    }
    
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${rule.label} må maksimalt være ${rule.maxLength} tegn`;
    }
  });
  
  return errors;
};

// Specific validation rules for forms
export const participantValidationRules = {
  participantNumber: {
    required: true,
    type: 'participantNumber',
    label: 'Deltager nummer'
  },
  dogName: {
    required: true,
    type: 'name',
    label: 'Hundens navn'
  },
  dogNumber: {
    required: true,
    type: 'dogNumber',
    label: 'Hunde nummer'
  },
  gender: {
    required: true,
    label: 'Køn'
  },
  color: {
    required: true,
    label: 'Farve'
  },
  breed: {
    required: true,
    label: 'Race'
  },
  father: {
    required: true,
    label: 'Fars navn'
  },
  mother: {
    required: true,
    label: 'Mors navn'
  },
  breeder: {
    required: true,
    label: 'Opdrætter'
  },
  owner: {
    required: true,
    label: 'Ejer'
  },
  handler: {
    required: true,
    label: 'Hundefører'
  },
  email: {
    required: true,
    type: 'email',
    label: 'Email'
  }
};

export const trialValidationRules = {
  name: {
    required: true,
    minLength: 3,
    label: 'Prøve navn'
  },
  date: {
    required: true,
    type: 'date',
    label: 'Dato'
  },
  numberOfPosts: {
    required: true,
    label: 'Antal poster'
  }
};

export const scoreValidationRules = {
  participantNumber: {
    required: true,
    type: 'participantNumber',
    label: 'Deltager nummer'
  },
  score: {
    required: true,
    type: 'score',
    label: 'Point'
  },
  postNumber: {
    required: true,
    label: 'Post nummer'
  }
};

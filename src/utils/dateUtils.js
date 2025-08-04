// Date utility functions for hundeprøve system

export const formatDate = (date) => {
  if (!date) return '';
  
  let dateObj = date;
  
  // Handle Firestore timestamp
  if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  }
  
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return '';
  }
  
  return dateObj.toLocaleDateString('da-DK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  
  let dateObj = date;
  
  // Handle Firestore timestamp
  if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  }
  
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return '';
  }
  
  return dateObj.toLocaleDateString('da-DK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  
  let dateObj = date;
  
  // Handle Firestore timestamp
  if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  }
  
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return '';
  }
  
  return dateObj.toLocaleTimeString('da-DK', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isToday = (date) => {
  if (!date) return false;
  
  let dateObj = date;
  
  // Handle Firestore timestamp
  if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  }
  
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return false;
  }
  
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

export const isPastDate = (date) => {
  if (!date) return false;
  
  let dateObj = date;
  
  // Handle Firestore timestamp
  if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  }
  
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  return dateObj < today;
};

export const isFutureDate = (date) => {
  if (!date) return false;
  
  let dateObj = date;
  
  // Handle Firestore timestamp
  if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  }
  
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  return dateObj > today;
};

export const getDaysUntil = (date) => {
  if (!date) return null;
  
  let dateObj = date;
  
  // Handle Firestore timestamp
  if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  }
  
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return null;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  const diffTime = dateObj - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const getRelativeDate = (date) => {
  const days = getDaysUntil(date);
  
  if (days === null) return '';
  
  if (days === 0) return 'I dag';
  if (days === 1) return 'I morgen';
  if (days === -1) return 'I går';
  if (days > 1) return `Om ${days} dage`;
  if (days < -1) return `${Math.abs(days)} dage siden`;
  
  return '';
};

export const formatDateForInput = (date) => {
  if (!date) return '';
  
  let dateObj = date;
  
  // Handle Firestore timestamp
  if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  }
  
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return '';
  }
  
  // Format as YYYY-MM-DD for HTML date input
  return dateObj.toISOString().split('T')[0];
};

export const parseInputDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date) ? null : date;
};

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Trials
export const createTrial = async (trialData) => {
  try {
    const docRef = await addDoc(collection(db, 'trials'), {
      ...trialData,
      createdAt: serverTimestamp(),
      status: 'upcoming',
      judges: [],
      participants: []
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating trial:', error);
    throw error;
  }
};

export const getTrials = async () => {
  try {
    const q = query(collection(db, 'trials'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching trials:', error);
    throw error;
  }
};

export const getTrial = async (trialId) => {
  try {
    const docRef = doc(db, 'trials', trialId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Trial not found');
    }
  } catch (error) {
    console.error('Error fetching trial:', error);
    throw error;
  }
};

export const updateTrial = async (trialId, updateData) => {
  try {
    const docRef = doc(db, 'trials', trialId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating trial:', error);
    throw error;
  }
};

// Participants
export const createParticipant = async (participantData) => {
  try {
    const docRef = await addDoc(collection(db, 'participants'), {
      ...participantData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating participant:', error);
    throw error;
  }
};

export const getParticipants = async (trialId = null) => {
  try {
    let q = collection(db, 'participants');
    
    if (trialId) {
      q = query(q, where('trialId', '==', trialId));
    }
    
    q = query(q, orderBy('participantNumber', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching participants:', error);
    throw error;
  }
};

export const getParticipant = async (participantId) => {
  try {
    const docRef = doc(db, 'participants', participantId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Participant not found');
    }
  } catch (error) {
    console.error('Error fetching participant:', error);
    throw error;
  }
};

// Scores
export const createScore = async (scoreData) => {
  try {
    const docRef = await addDoc(collection(db, 'scores'), {
      ...scoreData,
      timestamp: serverTimestamp(),
      isCompleted: true
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating score:', error);
    throw error;
  }
};

export const getScores = async (trialId, participantId = null) => {
  try {
    let q = query(collection(db, 'scores'), where('trialId', '==', trialId));
    
    if (participantId) {
      q = query(q, where('participantId', '==', participantId));
    }
    
    q = query(q, orderBy('postNumber', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching scores:', error);
    throw error;
  }
};

export const updateScore = async (scoreId, updateData) => {
  try {
    const docRef = doc(db, 'scores', scoreId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating score:', error);
    throw error;
  }
};

// Judge Invitations
export const createJudgeInvitation = async (invitationData) => {
  try {
    const docRef = await addDoc(collection(db, 'judgeInvitations'), {
      ...invitationData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
};

export const getJudgeInvitations = async (judgeEmail = null) => {
  try {
    let q = collection(db, 'judgeInvitations');
    
    if (judgeEmail) {
      q = query(q, where('judgeEmail', '==', judgeEmail));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching invitations:', error);
    throw error;
  }
};

export const updateJudgeInvitation = async (invitationId, status) => {
  try {
    const docRef = doc(db, 'judgeInvitations', invitationId);
    await updateDoc(docRef, {
      status,
      respondedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating invitation:', error);
    throw error;
  }
};

// Users
export const getUsers = async (role = null) => {
  try {
    let q = collection(db, 'users');
    
    if (role) {
      q = query(q, where('role', '==', role));
    }
    
    q = query(q, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

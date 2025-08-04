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
  serverTimestamp,
  onSnapshot 
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

// Real-time listener for scores
export const subscribeToScores = (trialId, participantId, callback) => {
  try {
    let q = collection(db, 'scores');
    
    const conditions = [where('trialId', '==', trialId)];
    if (participantId) {
      conditions.push(where('participantId', '==', participantId));
    }
    
    q = query(q, ...conditions, orderBy('postNumber', 'asc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const scores = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(scores);
    }, (error) => {
      console.error('Error in scores subscription:', error);
    });
  } catch (error) {
    console.error('Error setting up scores subscription:', error);
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

export const updateJudgeInvitation = async (invitationId, status, currentUserId = null) => {
  try {
    const docRef = doc(db, 'judgeInvitations', invitationId);
    
    // Get invitation details first
    const invitationSnap = await getDoc(docRef);
    if (!invitationSnap.exists()) {
      throw new Error('Invitation not found');
    }
    
    const invitation = invitationSnap.data();
    
    // Update invitation status
    await updateDoc(docRef, {
      status,
      respondedAt: serverTimestamp()
    });
    
    // If accepted, add judge to trial
    if (status === 'accepted') {
      // Find the judge's userId by email
      let judgeId = currentUserId; // Use provided userId if available
      
      if (!judgeId) {
        // Find judge by email if userId not provided
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('email', '==', invitation.judgeEmail));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          judgeId = userSnapshot.docs[0].id;
        } else {
          console.warn(`Judge with email ${invitation.judgeEmail} not found in users collection`);
        }
      }
      
      if (judgeId && invitation.trialId) {
        const trialRef = doc(db, 'trials', invitation.trialId);
        const trialSnap = await getDoc(trialRef);
        
        if (trialSnap.exists()) {
          const trial = trialSnap.data();
          const currentJudges = trial.judges || [];
          
          // Add judge if not already in the list
          if (!currentJudges.includes(judgeId)) {
            await updateDoc(trialRef, {
              judges: [...currentJudges, judgeId]
            });
          }
        } else {
          console.warn(`Trial with ID ${invitation.trialId} not found`);
        }
      } else {
        if (!judgeId) {
          console.error('Judge ID could not be determined for invitation acceptance');
        }
        if (!invitation.trialId) {
          console.error('Trial ID is missing from invitation');
        }
      }
    }
    
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

// Get trials for a specific judge based on accepted invitations
export const getJudgeTrials = async (judgeId, judgeEmail) => {
  try {
    // Get all invitations for this judge and filter accepted ones
    const invitationsQuery = query(
      collection(db, 'judgeInvitations'), 
      where('judgeEmail', '==', judgeEmail)
    );
    
    const invitationsSnapshot = await getDocs(invitationsQuery);
    
    // Filter accepted invitations
    const acceptedTrialIds = invitationsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(invitation => invitation.status === 'accepted')
      .map(invitation => invitation.trialId);
    
    if (acceptedTrialIds.length === 0) {
      return [];
    }
    
    // Get trials for accepted invitations
    const trialsPromises = acceptedTrialIds.map(async (trialId) => {
      const trialDoc = await getDoc(doc(db, 'trials', trialId));
      if (trialDoc.exists()) {
        return { id: trialDoc.id, ...trialDoc.data() };
      }
      return null;
    });
    
    const trials = await Promise.all(trialsPromises);
    return trials.filter(trial => trial !== null);
    
  } catch (error) {
    console.error('Error fetching judge trials:', error);
    throw error;
  }
};

// Assign judge to a specific post
export const assignJudgeToPost = async (trialId, judgeId, postNumber) => {
  try {
    const trialRef = doc(db, 'trials', trialId);
    const trialDoc = await getDoc(trialRef);
    
    if (!trialDoc.exists()) {
      throw new Error('Trial not found');
    }
    
    const trialData = trialDoc.data();
    const currentAssignments = trialData.postAssignments || {};
    const currentJudges = trialData.judges || [];
    
    // Remove judge from any previous post assignment
    Object.keys(currentAssignments).forEach(jId => {
      if (jId === judgeId) {
        delete currentAssignments[jId];
      }
    });
    
    // Assign judge to new post
    currentAssignments[judgeId] = postNumber;
    
    // Add judge to judges array if not already there
    const updatedJudges = currentJudges.includes(judgeId) 
      ? currentJudges 
      : [...currentJudges, judgeId];
    
    // Use merge to avoid overwriting other fields
    await updateDoc(trialRef, {
      postAssignments: currentAssignments,
      judges: updatedJudges
    });
    
    console.log('Successfully assigned judge to post:', { trialId, judgeId, postNumber });
    
  } catch (error) {
    console.error('Error assigning judge to post:', error);
    throw error;
  }
};

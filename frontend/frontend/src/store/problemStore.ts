import { create } from 'zustand';
import { 
  addDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp, 
  updateDoc, 
  doc, 
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Problem {
  id?: string;
  userId: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeTaken: number; // in minutes
  solvedAt: Timestamp;
  notes: string;
  link?: string;
  tags: string[];
  struggleLevel: number;
  usedHelp: boolean;
  needsRevisit: boolean;
  points: number;
}

interface ProblemState {
  problems: Problem[];
  loading: boolean;
  error: string | null;
  fetchProblems: (userId: string) => Promise<void>;
  addProblem: (problem: Omit<Problem, 'id' | 'points'>) => Promise<Problem>;
  updateProblem: (id: string, problem: Partial<Problem>) => Promise<void>;
  deleteProblem: (id: string) => Promise<void>;
  calculatePoints: (problem: Omit<Problem, 'id' | 'points'>) => number;
  toggleRevisit: (id: string, needsRevisit: boolean) => Promise<void>;
}

export const useProblemStore = create<ProblemState>((set, get) => ({
  problems: [],
  loading: false,
  error: null,

  fetchProblems: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'problems'),
        where('userId', '==', userId),
        orderBy('solvedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const problems: Problem[] = [];
      
      querySnapshot.forEach((doc) => {
        problems.push({ id: doc.id, ...doc.data() } as Problem);
      });
      
      set({ problems, loading: false });
    } catch (error) {
      console.error('Error fetching problems:', error);
      set({ error: 'Failed to fetch problems', loading: false });
    }
  },

  calculatePoints: (problem) => {
    let points = 0;
    
    // Base points by difficulty
    switch (problem.difficulty) {
      case 'Easy':
        points += 10;
        break;
      case 'Medium':
        points += 20;
        break;
      case 'Hard':
        points += 30;
        break;
    }
    
    // Bonus for solving quickly (under 15 minutes)
    if (problem.timeTaken < 15) {
      points += 5;
    }
    
    // Penalty for using help
    if (problem.usedHelp) {
      points -= 5;
    }
    
    return Math.max(points, 0); // Ensure points are never negative
  },

  addProblem: async (problemData) => {
    set({ loading: true, error: null });
    try {
      // Calculate points
      const points = get().calculatePoints(problemData);
      
      // Create the problem object with points
      const problem = {
        ...problemData,
        points,
        solvedAt: Timestamp.now(),
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'problems'), problem);
      
      // Create the complete problem with ID
      const newProblem = { ...problem, id: docRef.id };
      
      // Update the local state
      set((state) => ({
        problems: [newProblem, ...state.problems],
        loading: false
      }));
      
      return newProblem;
    } catch (error) {
      console.error('Error adding problem:', error);
      set({ error: 'Failed to add problem', loading: false });
      throw error;
    }
  },

  updateProblem: async (id, problemUpdate) => {
    set({ loading: true, error: null });
    try {
      await updateDoc(doc(db, 'problems', id), problemUpdate);
      
      set((state) => ({
        problems: state.problems.map((p) => 
          p.id === id ? { ...p, ...problemUpdate } : p
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating problem:', error);
      set({ error: 'Failed to update problem', loading: false });
    }
  },

  deleteProblem: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'problems', id));
      
      set((state) => ({
        problems: state.problems.filter((p) => p.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting problem:', error);
      set({ error: 'Failed to delete problem', loading: false });
    }
  },

  toggleRevisit: async (id, needsRevisit) => {
    try {
      await updateDoc(doc(db, 'problems', id), { needsRevisit });
      
      set((state) => ({
        problems: state.problems.map((p) => 
          p.id === id ? { ...p, needsRevisit } : p
        )
      }));
    } catch (error) {
      console.error('Error toggling revisit:', error);
      set({ error: 'Failed to update problem' });
    }
  }
}));
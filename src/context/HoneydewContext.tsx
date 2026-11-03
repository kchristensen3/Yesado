import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Person, Task, TaskStatus, TaskNote, TaskPriority, House } from '../types';
import { DEFAULT_PEOPLE, DEFAULT_PROJECTS, DEFAULT_TASKS } from '../initialData';
import { auth, db, googleProvider, OperationType, handleFirestoreError } from '../firebase';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where, setDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';

export interface YesadoContextType {
  tasks: Task[];
  projects: Project[];
  people: Person[];
  houses: House[];
  activeHouseId: string;
  selectedProjectId: string; // 'all' or specific projectId
  searchQuery: string;
  sortBy: 'date' | 'status' | 'custom' | 'priority';
  theme: 'light' | 'dark';
  user: User | null;
  loading: boolean;
  filterPersonId: string;
  filterStatus: string;
  filterPriority: string;
  
  // State Setters & Actions
  setActiveHouseId: (id: string) => void;
  setSelectedProjectId: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'date' | 'status' | 'custom' | 'priority') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setFilterPersonId: (id: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterPriority: (priority: string) => void;
  
  // Auth actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginError: string | null;
  setLoginError: (error: string | null) => void;
  firestoreError: string | null;
  setFirestoreError: (error: string | null) => void;
  
  // House operations
  addHouse: (name: string) => Promise<House | null>;
  addCollaboratorToHouse: (houseId: string, email: string) => Promise<void>;
  removeCollaboratorFromHouse: (houseId: string, email: string) => Promise<void>;
  updateHouse: (houseId: string, updates: Partial<Omit<House, 'id' | 'createdAt' | 'collaborators'>>) => Promise<void>;
  
  // Task operations
  addTask: (title: string, projectId: string, assigneeId?: string, targetDate?: string, kind?: 'chore' | 'project', priority?: TaskPriority) => Promise<Task | null>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTaskDetails: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'notes' | 'collaborators'>>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Task Notes
  addTaskNote: (taskId: string, content: string) => Promise<void>;
  deleteTaskNote: (taskId: string, noteId: string) => Promise<void>;
  
  // Project operations
  addProject: (name: string, description?: string, colorClass?: string) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Omit<Project, 'id' | 'createdAt' | 'collaborators'>>) => Promise<void>;
  
  // Person operations
  addPerson: (name: string, colorClass?: string) => Promise<Person | null>;
  deletePerson: (personId: string) => Promise<void>;
  updatePerson: (personId: string, updates: Partial<Omit<Person, 'id' | 'createdAt' | 'collaborators'>>) => Promise<void>;
}

export type HoneydewContextType = YesadoContextType;

export const YesadoContext = createContext<YesadoContextType | undefined>(undefined);
export const HoneydewContext = YesadoContext;

const COLOR_TEMPLATES = ['emerald', 'amber', 'blue', 'stone', 'rose', 'indigo', 'violet', 'orange'];
const AVATAR_BG_TEMPLATES = [
  'bg-emerald-500 text-white',
  'bg-rose-500 text-white',
  'bg-amber-400 text-slate-900',
  'bg-blue-500 text-white',
  'bg-violet-500 text-white',
  'bg-orange-500 text-white',
  'bg-indigo-500 text-white',
];

export const YesadoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  const [houses, setHouses] = useState<House[]>([]);
  const [activeHouseId, setActiveHouseId] = useState<string>(() => {
    return localStorage.getItem('yesado_active_house_id') || localStorage.getItem('honeydew_active_house_id') || '';
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'custom' | 'priority'>('custom');
  const [filterPersonId, setFilterPersonId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>(() => {
    return localStorage.getItem('yesado_filter_status') || 'active';
  });
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('yesado_theme') || localStorage.getItem('honeydew_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  // Persist filterStatus
  useEffect(() => {
    if (filterStatus) {
      localStorage.setItem('yesado_filter_status', filterStatus);
    }
  }, [filterStatus]);

  // Track light/dark mode preference locally
  useEffect(() => {
    localStorage.setItem('yesado_theme', theme);
  }, [theme]);

  // Track active House ID local storage
  useEffect(() => {
    if (activeHouseId) {
      localStorage.setItem('yesado_active_house_id', activeHouseId);
    }
  }, [activeHouseId]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // Sign In with Google
  const login = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      console.error('Google Sign-In Error:', e);
      let errMsg = e?.message || String(e);
      if (e?.code === 'auth/unauthorized-domain') {
        const hostname = window.location.hostname;
        errMsg = `Unauthorized Domain: Target server domain "${hostname}" has not been added to Auth Settings yet. Please log in to Firebase Console -> Authentication -> Settings -> Authorized Domains and add: \n• ${hostname}`;
      } else if (e?.code === 'auth/popup-blocked') {
        errMsg = 'The Google Sign-In popup was blocked by your browser. Please allow popups for this origin or open this app in a New Tab.';
      } else if (e?.code === 'auth/network-request-failed') {
        errMsg = 'Connection failed. Please check your internet connection or verify your Firebase configuration.';
      } else if (e?.code === 'auth/internal-error') {
        errMsg = 'Iframe Sandbox Block: Browsers often block popups inside iframe previews (AI Studio). Please click the "Open in new tab" icon at the top-right of your preview frame to sign in successfully!';
      } else if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') {
        errMsg = 'Google Sign-In was closed before completion. Please verify your Firebase setup and try clicking "Open in template/new tab" if you are currently using the AI Studio sidebar preview.';
      }
      setLoginError(errMsg);
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign-Out Error:', e);
    }
  };

  // Auth State Listener & Autoseeding for new users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setTasks([]);
        setProjects([]);
        setPeople([]);
        setHouses([]);
        setActiveHouseId('');
        setLoading(false);
      } else {
        setLoading(true);
        try {
          // Clear any stale database errors on sign in
          setFirestoreError(null);
          
          const houseRef = collection(db, 'houses');
          let snap;
          try {
            const hq = query(houseRef, where('ownerId', '==', currentUser.uid));
            snap = await getDocs(hq);
          } catch (e) {
            handleFirestoreError(e, OperationType.LIST, 'houses');
            return;
          }
          
          if (snap.empty) {
            // Check if they are collaborator on any houses before seeding
            const rawEmail = (currentUser.email || '').trim();
            let collabSnap: any = { empty: true };
            if (rawEmail) {
              try {
                const hCollabQuery = query(houseRef, where('collaborators', 'array-contains', rawEmail));
                collabSnap = await getDocs(hCollabQuery);
              } catch (e) {
                console.warn('Checking collab houses warning:', e);
              }
            }
            
            if (collabSnap.empty) {
              // New user has absolutely no houses, let's bootstrap one with stylish default data
              console.log('Seeding debut house & stylish default data for:', currentUser.email);
              const batch = writeBatch(db);
              
              const newHouseId = `house_${Date.now()}`;
              const initialCollabs = rawEmail ? Array.from(new Set([rawEmail, rawEmail.toLowerCase()])) : [];
              
              const newHouseDoc = doc(db, 'houses', newHouseId);
              batch.set(newHouseDoc, {
                id: newHouseId,
                name: "Primary Home",
                ownerId: currentUser.uid,
                collaborators: initialCollabs,
                createdAt: new Date().toISOString()
              });
              
              DEFAULT_PROJECTS.forEach((proj) => {
                const uniqueProjId = `${proj.id}_${newHouseId}`;
                const docRef = doc(db, 'projects', uniqueProjId);
                batch.set(docRef, { 
                  ...proj, 
                  id: uniqueProjId,
                  houseId: newHouseId,
                  collaborators: initialCollabs,
                  ownerId: currentUser.uid, 
                  createdAt: new Date().toISOString() 
                });
              });
              
              DEFAULT_PEOPLE.forEach((person) => {
                const uniquePersonId = `${person.id}_${newHouseId}`;
                const docRef = doc(db, 'people', uniquePersonId);
                batch.set(docRef, { 
                  ...person, 
                  id: uniquePersonId,
                  houseId: newHouseId,
                  collaborators: initialCollabs,
                  ownerId: currentUser.uid, 
                  createdAt: new Date().toISOString() 
                });
              });
              
              DEFAULT_TASKS.forEach((task) => {
                const uniqueTaskId = `${task.id}_${newHouseId}`;
                const mappedProjectId = `${task.projectId}_${newHouseId}`;
                const mappedAssigneeId = task.assigneeId ? `${task.assigneeId}_${newHouseId}` : '';
                const docRef = doc(db, 'tasks', uniqueTaskId);
                batch.set(docRef, { 
                  ...task, 
                  id: uniqueTaskId,
                  projectId: mappedProjectId,
                  assigneeId: mappedAssigneeId,
                  houseId: newHouseId,
                  collaborators: initialCollabs,
                  ownerId: currentUser.uid 
                });
              });
              
              try {
                await batch.commit();
              } catch (e) {
                handleFirestoreError(e, OperationType.WRITE, 'seeding_batch');
                return;
              }
              setActiveHouseId(newHouseId);
            }
          }
        } catch (e: any) {
          console.error('Error checking/seeding initial data in Firestore:', e);
          setFirestoreError(e?.message || String(e));
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Listeners for Real-Time cloud sync
  // Listeners for Real-Time cloud sync
  useEffect(() => {
    if (!user) return;

    const rawEmail = (user.email || '').trim();

    // Query houses where user is OWNER
    const hOwnerQuery = query(collection(db, 'houses'), where('ownerId', '==', user.uid));
    
    let ownerHouses: House[] = [];
    let collabHouses: House[] = [];

    const syncHousesMerged = (ownerList: House[], collabList: House[]) => {
      const merged: House[] = [...ownerList];
      collabList.forEach((ch) => {
        if (!merged.some((h) => h.id === ch.id)) {
          merged.push(ch);
        }
      });
      setHouses(merged);

      if (merged.length > 0) {
        const stored = localStorage.getItem('yesado_active_house_id') || localStorage.getItem('honeydew_active_house_id');
        const exists = merged.some((h) => h.id === stored);
        if (exists && stored) {
          setActiveHouseId(stored);
        } else {
          setActiveHouseId(merged[0].id);
        }
      } else {
        setActiveHouseId('');
      }
    };

    const unsubOwner = onSnapshot(
      hOwnerQuery,
      (snap) => {
        const list: House[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as House);
        });
        ownerHouses = list;
        syncHousesMerged(ownerHouses, collabHouses);
      },
      (err) => {
        console.error("Owner houses onSnapshot error:", err);
        setFirestoreError(err.message || String(err));
      }
    );

    let unsubCollab = () => {};
    if (rawEmail) {
      const hCollabQuery = query(collection(db, 'houses'), where('collaborators', 'array-contains', rawEmail));
      unsubCollab = onSnapshot(
        hCollabQuery,
        (snap) => {
          const list: House[] = [];
          snap.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as House);
          });
          collabHouses = list;
          syncHousesMerged(ownerHouses, collabHouses);
        },
        (err) => {
          console.warn("Collab houses onSnapshot:", err);
        }
      );
    }

    return () => {
      unsubOwner();
      unsubCollab();
    };
  }, [user]);

  // Projects, People, Tasks Child Listeners based on selected Active House
  useEffect(() => {
    if (!user || !activeHouseId) {
      setProjects([]);
      setPeople([]);
      setTasks([]);
      return;
    }

    const rawEmail = (user.email || '').trim();

    // 1. Projects sync: query owner projects + collaborator projects and merge
    let ownerProjects: Project[] = [];
    let collabProjects: Project[] = [];
    const syncProjectsMerged = (owned: Project[], shared: Project[]) => {
      const map = new Map<string, Project>();
      owned.forEach(p => { if (p.houseId === activeHouseId) map.set(p.id, p); });
      shared.forEach(p => { if (p.houseId === activeHouseId) map.set(p.id, p); });
      setProjects(Array.from(map.values()));
    };

    const unsubProjOwner = onSnapshot(
      query(collection(db, 'projects'), where('ownerId', '==', user.uid)),
      (snap) => {
        const loaded: Project[] = [];
        snap.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() } as Project));
        ownerProjects = loaded;
        syncProjectsMerged(ownerProjects, collabProjects);
      },
      (err) => {
        console.error("Projects owner snapshot error:", err);
      }
    );

    let unsubProjCollab = () => {};
    if (rawEmail) {
      unsubProjCollab = onSnapshot(
        query(collection(db, 'projects'), where('collaborators', 'array-contains', rawEmail)),
        (snap) => {
          const loaded: Project[] = [];
          snap.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() } as Project));
          collabProjects = loaded;
          syncProjectsMerged(ownerProjects, collabProjects);
        },
        (err) => {
          console.warn("Projects collab snapshot:", err);
        }
      );
    }

    // 2. People sync: query owner people + collaborator people and merge
    let ownerPeople: Person[] = [];
    let collabPeople: Person[] = [];
    const syncPeopleMerged = (owned: Person[], shared: Person[]) => {
      const map = new Map<string, Person>();
      owned.forEach(pe => { if (pe.houseId === activeHouseId) map.set(pe.id, pe); });
      shared.forEach(pe => { if (pe.houseId === activeHouseId) map.set(pe.id, pe); });
      setPeople(Array.from(map.values()));
    };

    const unsubPeopleOwner = onSnapshot(
      query(collection(db, 'people'), where('ownerId', '==', user.uid)),
      (snap) => {
        const loaded: Person[] = [];
        snap.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() } as Person));
        ownerPeople = loaded;
        syncPeopleMerged(ownerPeople, collabPeople);
      },
      (err) => {
        console.error("People owner snapshot error:", err);
      }
    );

    let unsubPeopleCollab = () => {};
    if (rawEmail) {
      unsubPeopleCollab = onSnapshot(
        query(collection(db, 'people'), where('collaborators', 'array-contains', rawEmail)),
        (snap) => {
          const loaded: Person[] = [];
          snap.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() } as Person));
          collabPeople = loaded;
          syncPeopleMerged(ownerPeople, collabPeople);
        },
        (err) => {
          console.warn("People collab snapshot:", err);
        }
      );
    }

    // 3. Tasks sync: query owner tasks + collaborator tasks and merge
    let ownerTasks: Task[] = [];
    let collabTasks: Task[] = [];
    const syncTasksMerged = (owned: Task[], shared: Task[]) => {
      const map = new Map<string, Task>();
      owned.forEach(t => { if (t.houseId === activeHouseId) map.set(t.id, t); });
      shared.forEach(t => { if (t.houseId === activeHouseId) map.set(t.id, t); });
      setTasks(Array.from(map.values()));
    };

    const unsubTasksOwner = onSnapshot(
      query(collection(db, 'tasks'), where('ownerId', '==', user.uid)),
      (snap) => {
        const loaded: Task[] = [];
        snap.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() } as Task));
        ownerTasks = loaded;
        syncTasksMerged(ownerTasks, collabTasks);
      },
      (err) => {
        console.error("Tasks owner snapshot error:", err);
      }
    );

    let unsubTasksCollab = () => {};
    if (rawEmail) {
      unsubTasksCollab = onSnapshot(
        query(collection(db, 'tasks'), where('collaborators', 'array-contains', rawEmail)),
        (snap) => {
          const loaded: Task[] = [];
          snap.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() } as Task));
          collabTasks = loaded;
          syncTasksMerged(ownerTasks, collabTasks);
        },
        (err) => {
          console.warn("Tasks collab snapshot:", err);
        }
      );
    }

    return () => {
      unsubProjOwner();
      unsubProjCollab();
      unsubPeopleOwner();
      unsubPeopleCollab();
      unsubTasksOwner();
      unsubTasksCollab();
    };
  }, [user, activeHouseId]);

  // House actions
  const addHouse = async (name: string) => {
    if (!user) return null;
    const id = `house_${Date.now()}`;
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const newHouse: House = {
      id,
      name: name.trim(),
      ownerId: user.uid,
      collaborators: cleanEmail ? [cleanEmail] : [],
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'houses', id), newHouse);
      setActiveHouseId(id);
      return newHouse;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `houses/${id}`);
      return null;
    }
  };

  const addCollaboratorToHouse = async (houseId: string, email: string) => {
    if (!user) return;
    const targetHouse = houses.find((h) => h.id === houseId);
    if (!targetHouse) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    if (targetHouse.collaborators.includes(cleanEmail)) return;

    const newCollabs = [...targetHouse.collaborators, cleanEmail];

    try {
      const batch = writeBatch(db);
      
      // Update House Document
      batch.set(doc(db, 'houses', houseId), { collaborators: newCollabs }, { merge: true });

      // Copy collaborators downstream to Project, Person, Task for immediate stateless rule checks
      projects.filter((p) => p.houseId === houseId).forEach((p) => {
        batch.set(doc(db, 'projects', p.id), { collaborators: newCollabs }, { merge: true });
      });
      people.filter((pe) => pe.houseId === houseId).forEach((pe) => {
        batch.set(doc(db, 'people', pe.id), { collaborators: newCollabs }, { merge: true });
      });
      tasks.filter((t) => t.houseId === houseId).forEach((t) => {
        batch.set(doc(db, 'tasks', t.id), { collaborators: newCollabs }, { merge: true });
      });

      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `houses/${houseId}`);
    }
  };

  const removeCollaboratorFromHouse = async (houseId: string, email: string) => {
    if (!user) return;
    const targetHouse = houses.find((h) => h.id === houseId);
    if (!targetHouse) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    if (!targetHouse.collaborators.includes(cleanEmail)) return;

    // Prevent removing signed-in user themselves to protect lockout
    if (cleanEmail === (user.email || '').trim().toLowerCase()) {
      return;
    }

    const newCollabs = targetHouse.collaborators.filter((c) => c !== cleanEmail);

    try {
      const batch = writeBatch(db);
      
      // Update House Document
      batch.set(doc(db, 'houses', houseId), { collaborators: newCollabs }, { merge: true });

      // Update downstream items for strict stateless queries
      projects.filter((p) => p.houseId === houseId).forEach((p) => {
        batch.set(doc(db, 'projects', p.id), { collaborators: newCollabs }, { merge: true });
      });
      people.filter((pe) => pe.houseId === houseId).forEach((pe) => {
        batch.set(doc(db, 'people', pe.id), { collaborators: newCollabs }, { merge: true });
      });
      tasks.filter((t) => t.houseId === houseId).forEach((t) => {
        batch.set(doc(db, 'tasks', t.id), { collaborators: newCollabs }, { merge: true });
      });

      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `houses/${houseId}`);
    }
  };

  const updateHouse = async (
    houseId: string,
    updates: Partial<Omit<House, 'id' | 'createdAt' | 'collaborators'>>
  ) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'houses', houseId), updates, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `houses/${houseId}`);
    }
  };

  // Tasks actions
  const addTask = async (
    title: string, 
    projectId: string, 
    assigneeId?: string, 
    targetDate?: string, 
    kind?: 'chore' | 'project', 
    priority?: TaskPriority
  ) => {
    if (!user || !activeHouseId) return null;
    const currentHouse = houses.find((h) => h.id === activeHouseId);
    const collabs = currentHouse ? currentHouse.collaborators : [(user.email || '').trim().toLowerCase()];

    const uncategorizedProj = projects.find(p => p.id.startsWith('uncategorized'));
    const actualProjId = projectId === 'uncategorized' || !projectId
      ? (uncategorizedProj?.id || 'uncategorized')
      : projectId;

    const id = `task_${Date.now()}`;
    const newTask: Task = {
      id,
      houseId: activeHouseId,
      projectId: actualProjId,
      title: title.trim(),
      status: 'pending',
      targetDate: targetDate || '',
      assigneeId: assigneeId || '',
      notes: [],
      createdAt: new Date().toISOString(),
      kind: kind || 'project',
      priority: priority || 'medium',
      collaborators: collabs,
    };
    try {
      await setDoc(doc(db, 'tasks', id), {
        ...newTask,
        ownerId: user.uid,
      });
      return newTask;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `tasks/${id}`);
      return null;
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'tasks', taskId), { status }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const updateTaskDetails = async (
    taskId: string, 
    updates: Partial<Omit<Task, 'id' | 'createdAt' | 'notes' | 'collaborators'>>
  ) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'tasks', taskId), updates, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  // Note actions
  const addTaskNote = async (taskId: string, content: string) => {
    if (!user || !content.trim()) return;
    const newNote: TaskNote = {
      id: `note_${Date.now()}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      await setDoc(
        doc(db, 'tasks', taskId),
        { notes: [...task.notes, newNote] },
        { merge: true }
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const deleteTaskNote = async (taskId: string, noteId: string) => {
    if (!user) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      await setDoc(
        doc(db, 'tasks', taskId),
        { notes: task.notes.filter((n) => n.id !== noteId) },
        { merge: true }
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  // Projects actions
  const addProject = async (name: string, description?: string, colorClass?: string) => {
    if (!user || !activeHouseId) return null;
    const currentHouse = houses.find((h) => h.id === activeHouseId);
    const collabs = currentHouse ? currentHouse.collaborators : [(user.email || '').trim().toLowerCase()];

    const id = `proj_${Date.now()}`;
    const randomColor = COLOR_TEMPLATES[Math.floor(Math.random() * COLOR_TEMPLATES.length)];
    const newProj: Project = {
      id,
      houseId: activeHouseId,
      name: name.trim(),
      description: description?.trim() || '',
      colorClass: colorClass || randomColor,
      collaborators: collabs,
    };
    try {
      await setDoc(doc(db, 'projects', id), {
        ...newProj,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      });
      return newProj;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `projects/${id}`);
      return null;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return;
    try {
      const uncategorizedProj = projects.find(p => p.id.startsWith('uncategorized'));
      const targetUncategorizedId = uncategorizedProj?.id || 'uncategorized';
      const batch = writeBatch(db);
      tasks.forEach((t) => {
        if (t.projectId === projectId) {
          batch.update(doc(db, 'tasks', t.id), { projectId: targetUncategorizedId });
        }
      });
      batch.delete(doc(db, 'projects', projectId));
      await batch.commit();

      if (selectedProjectId === projectId) {
        setSelectedProjectId('all');
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `projects/${projectId}`);
    }
  };

  const updateProject = async (
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt' | 'collaborators'>>
  ) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'projects', projectId), updates, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  // People actions
  const addPerson = async (name: string, colorClass?: string) => {
    if (!user || !activeHouseId) return null;
    const currentHouse = houses.find((h) => h.id === activeHouseId);
    const collabs = currentHouse ? currentHouse.collaborators : [(user.email || '').trim().toLowerCase()];

    const id = `person_${Date.now()}`;
    const randomBg = AVATAR_BG_TEMPLATES[Math.floor(Math.random() * AVATAR_BG_TEMPLATES.length)];
    const newPerson: Person = {
      id,
      houseId: activeHouseId,
      name: name.trim(),
      colorClass: colorClass || randomBg,
      collaborators: collabs,
    };
    try {
      await setDoc(doc(db, 'people', id), {
        ...newPerson,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      });
      return newPerson;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `people/${id}`);
      return null;
    }
  };

  const deletePerson = async (personId: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      tasks.forEach((t) => {
        if (t.assigneeId === personId) {
          batch.update(doc(db, 'tasks', t.id), { assigneeId: undefined });
        }
      });
      batch.delete(doc(db, 'people', personId));
      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `people/${personId}`);
    }
  };

  const updatePerson = async (
    personId: string,
    updates: Partial<Omit<Person, 'id' | 'createdAt' | 'collaborators'>>
  ) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'people', personId), updates, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `people/${personId}`);
    }
  };

  return (
    <YesadoContext.Provider
      value={{
        tasks,
        projects,
        people,
        houses,
        activeHouseId,
        selectedProjectId,
        searchQuery,
        sortBy,
        theme,
        user,
        loading,
        filterPersonId,
        filterStatus,
        filterPriority,
        setActiveHouseId,
        setSelectedProjectId,
        setSearchQuery,
        setSortBy,
        setTheme,
        toggleTheme,
        setFilterPersonId,
        setFilterStatus,
        setFilterPriority,
        login,
        logout,
        loginError,
        setLoginError,
        firestoreError,
        setFirestoreError,
        addHouse,
        addCollaboratorToHouse,
        removeCollaboratorFromHouse,
        updateHouse,
        addTask,
        updateTaskStatus,
        updateTaskDetails,
        deleteTask,
        addTaskNote,
        deleteTaskNote,
        addProject,
        deleteProject,
        updateProject,
        addPerson,
        deletePerson,
        updatePerson,
      }}
    >
      {children}
    </YesadoContext.Provider>
  );
};

export const HoneydewProvider = YesadoProvider;

export const useYesado = () => {
  const context = useContext(YesadoContext);
  if (!context) {
    throw new Error('useYesado must be used within a YesadoProvider');
  }
  return context;
};

export const useHoneydew = useYesado;


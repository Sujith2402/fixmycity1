import {
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    getDoc,
    Timestamp,
    arrayUnion
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Issue, IssueStatus, IssueCategory, HistoryEntry, AdminNote } from '@/types';

const ISSUES_COLLECTION = 'issues';

export const issueService = {
    /**
     * Create a new issue report
     */
    async createIssue(data: {
        title: string;
        description: string;
        category: IssueCategory;
        latitude: number;
        longitude: number;
        reportedBy: string;
        reporterName: string;
        imageFile?: File;
    }): Promise<string> {
        let imageUrl = '';

        if (data.imageFile) {
            const storageRef = ref(storage, `issues/${Date.now()}_${data.imageFile.name}`);
            const uploadResult = await uploadBytes(storageRef, data.imageFile);
            imageUrl = await getDownloadURL(uploadResult.ref);
        }

        const issueData = {
            title: data.title,
            description: data.description,
            category: data.category,
            latitude: data.latitude,
            longitude: data.longitude,
            imageUrl,
            status: 'reported' as IssueStatus,
            reportedBy: data.reportedBy,
            reporterName: data.reporterName,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            upvotes: 0,
            history: [
                {
                    status: 'reported',
                    updatedBy: data.reporterName,
                    timestamp: new Date().toISOString(),
                    comment: 'Issue reported by citizen'
                }
            ],
            notes: []
        };

        const docRef = await addDoc(collection(db, ISSUES_COLLECTION), issueData);
        return docRef.id;
    },

    /**
     * Subscribe to all issues (Admin view)
     */
    subscribeToAllIssues(callback: (issues: Issue[]) => void, onError?: (error: any) => void) {
        // Remove orderBy to avoid composite index requirements in complex queries
        // and add error handling for better debugging
        const q = query(collection(db, ISSUES_COLLECTION));

        return onSnapshot(q, (snapshot) => {
            const issues = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Issue[];
            callback(issues);
        }, (error) => {
            console.error("Firestore Error (subscribeToAllIssues):", error);
            if (onError) onError(error);
        });
    },

    /**
     * Subscribe to issues reported by a specific user
     */
    subscribeToUserIssues(userId: string, callback: (issues: Issue[]) => void, onError?: (error: any) => void) {
        const q = query(
            collection(db, ISSUES_COLLECTION),
            where('reportedBy', '==', userId)
        );

        return onSnapshot(q, (snapshot) => {
            const issues = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Issue[];
            callback(issues);
        }, (error) => {
            console.error("Firestore Error (subscribeToUserIssues):", error);
            if (onError) onError(error);
        });
    },

    /**
     * Subscribe to a single issue's details
     */
    subscribeToIssueDetails(issueId: string, callback: (issue: Issue | null) => void) {
        return onSnapshot(doc(db, ISSUES_COLLECTION, issueId), (doc) => {
            if (doc.exists()) {
                callback({ id: doc.id, ...doc.data() } as Issue);
            } else {
                callback(null);
            }
        });
    },

    /**
     * Update issue status (Admin action)
     */
    async updateIssueStatus(
        issueId: string,
        status: IssueStatus,
        updatedBy: string,
        comment?: string,
        additionalData?: Partial<Issue>
    ) {
        const issueRef = doc(db, ISSUES_COLLECTION, issueId);
        const historyEntry: HistoryEntry = {
            status,
            updatedBy,
            timestamp: new Date().toISOString(),
            comment
        };

        await updateDoc(issueRef, {
            ...additionalData,
            status,
            updatedAt: serverTimestamp(),
            history: arrayUnion(historyEntry)
        });
    },

    /**
     * Add a note to an issue (Admin action)
     */
    async addIssueNote(issueId: string, note: Omit<AdminNote, 'id' | 'timestamp'>) {
        const issueRef = doc(db, ISSUES_COLLECTION, issueId);
        const fullNote: AdminNote = {
            ...note,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
        };

        await updateDoc(issueRef, {
            notes: arrayUnion(fullNote),
            updatedAt: serverTimestamp()
        });
    }
};

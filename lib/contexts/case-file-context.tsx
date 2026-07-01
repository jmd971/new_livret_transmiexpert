'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CaseFile } from '@/lib/types/case-files';

interface CaseFileContextType {
  activeCaseFile: CaseFile | null;
  caseFiles: CaseFile[];
  isLoading: boolean;
  setActiveCaseFile: (caseFile: CaseFile) => void;
  refreshCaseFiles: () => Promise<void>;
  initializeCaseFile: () => Promise<CaseFile | null>;
}

const CaseFileContext = createContext<CaseFileContextType | undefined>(undefined);

export function CaseFileProvider({ children }: { children: React.ReactNode }) {
  const [activeCaseFile, setActiveCaseFileState] = useState<CaseFile | null>(null);
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const refreshCaseFiles = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await (supabase.from('case_files') as any)
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCaseFiles(data || []);

      if (data && data.length > 0 && !activeCaseFile) {
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('activeCaseFileId') : null;
        const activeFile = savedId ? data.find((cf: any) => cf.id === savedId) || data[0] : data[0];
        setActiveCaseFileState(activeFile);
        if (typeof window !== 'undefined') localStorage.setItem('activeCaseFileId', activeFile.id);
      }
    } catch (error) {
      console.error('Error loading case files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeCaseFile = async (): Promise<CaseFile | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      // RPC identique à l'app existante ; à recréer dans la base V4 (cf. supabase/migrations).
      const { data, error } = await (supabase as any).rpc('initialize_default_case_file', {
        p_user_id: user.id,
      });
      if (error) throw error;

      await refreshCaseFiles();

      const { data: caseFile } = await (supabase.from('case_files') as any).select('*').eq('id', data).single();
      if (caseFile) {
        setActiveCaseFileState(caseFile);
        if (typeof window !== 'undefined') localStorage.setItem('activeCaseFileId', caseFile.id);
        return caseFile;
      }
      return null;
    } catch (error) {
      console.error('Error initializing case file:', error);
      return null;
    }
  };

  const setActiveCaseFile = (caseFile: CaseFile) => {
    setActiveCaseFileState(caseFile);
    if (typeof window !== 'undefined') localStorage.setItem('activeCaseFileId', caseFile.id);
  };

  useEffect(() => {
    refreshCaseFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (caseFiles.length === 0 && !isLoading) {
      initializeCaseFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseFiles, isLoading]);

  return (
    <CaseFileContext.Provider
      value={{ activeCaseFile, caseFiles, isLoading, setActiveCaseFile, refreshCaseFiles, initializeCaseFile }}
    >
      {children}
    </CaseFileContext.Provider>
  );
}

export function useCaseFile() {
  const context = useContext(CaseFileContext);
  if (context === undefined) {
    throw new Error('useCaseFile must be used within a CaseFileProvider');
  }
  return context;
}

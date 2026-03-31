import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from '../../types';
import { SupabaseService } from './supabaseService';

export const useRealtimeFeed = (initialPosts: Post[]) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    // Subscribe to changes in the 'posts' table
    const channel = supabase
      .channel('realtime-posts')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          console.log('Realtime update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newPost = SupabaseService.mapPost(payload.new);
            // Only add if it's public
            if (newPost.visibility === 'public') {
              setPosts(prev => [newPost, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedPost = SupabaseService.mapPost(payload.new);
            setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { posts, setPosts };
};

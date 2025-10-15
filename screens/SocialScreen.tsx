import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  Alert,
  Share,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTournaments, useAOYStandings } from '../lib/hooks/useQueries';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { showSuccess, showError } from '../utils/toast';
import EmptyState from '../components/EmptyState';
import { makeStyles } from '../lib/designTokens';
import { useTheme } from '../lib/ThemeContext';
import type { BrandTheme } from '../lib/ThemeContext';

interface CommunityPost {
  id: string;
  author_name: string;
  author_avatar?: string;
  post_type: 'photo' | 'achievement' | 'tournament_update' | 'general';
  content: string;
  image_url?: string;
  tournament_id?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

interface Member {
  id: string;
  name: string;
  avatar_url?: string;
  total_points: number;
  tournaments_participated: number;
  current_rank: number;
  status: 'online' | 'offline' | 'in_tournament';
  last_seen?: string;
}

interface ChatMessage {
  id: string;
  sender_name: string;
  sender_avatar?: string;
  message: string;
  timestamp: string;
  tournament_id?: string;
}

const SocialScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data: tournaments } = useTournaments();
  const { data: standings } = useAOYStandings();
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'chat'>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  
  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    try {
      // Try to load community posts from Supabase (table: community_posts)
      const [{ data: postsData, error: postsError }, { data: membersData, error: membersError }, { data: chatData, error: chatError }] = await Promise.all([
        supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('members').select('id, member_name as name, avatar_url, total_points, tournaments_participated, current_rank, status, last_seen').limit(50),
        supabase.from('community_chat').select('*').order('timestamp', { ascending: false }).limit(100),
      ] as any);

      if (postsError) {
        console.warn('No community_posts table or error fetching posts:', postsError);
        setPosts([]);
      } else {
        setPosts(postsData || []);
      }

      if (membersError) {
        console.warn('No members table or error fetching members:', membersError);
        setMembers([]);
      } else {
        setMembers(membersData || []);
      }

      if (chatError) {
        console.warn('No community_chat table or error fetching chat:', chatError);
        setChatMessages([]);
      } else {
        setChatMessages(chatData || []);
      }

    } catch (error) {
      console.error('Error loading social data:', error);
      showError('Failed to load community data');
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSocialData();
    setRefreshing(false);
  };
  
  const handleLikePost = async (postId: string) => {
    try {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                is_liked: !post.is_liked,
                likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
              }
            : post
        )
      );
      
      // In real app, this would sync with Supabase
      showSuccess(posts.find(p => p.id === postId)?.is_liked ? 'Post unliked' : 'Post liked!');
    } catch (error) {
      console.error('Error liking post:', error);
      showError('Failed to like post');
    }
  };
  
  const handleSharePost = async (post: CommunityPost) => {
    try {
      await Share.share({
        message: `Check out this post from ${post.author_name}: ${post.content}`,
        title: 'Trophy Cast Community',
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };
  
  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;
    
    try {
      const newPost: CommunityPost = {
        id: Date.now().toString(),
        author_name: 'You', // In real app, use actual user name
        post_type: 'general',
        content: newPostText,
        created_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0,
        is_liked: false
      };
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setNewPostText('');
      setShowNewPostModal(false);
      showSuccess('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      showError('Failed to create post');
    }
  };
  
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    try {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender_name: 'You', // In real app, use actual user name
        message: chatInput,
        timestamp: new Date().toISOString(),
        tournament_id: 'fall_classic_2025'
      };
      
      setChatMessages(prevMessages => [...prevMessages, newMessage]);
      setChatInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
    }
  };
  
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return theme.success;
      case 'in_tournament': return theme.warning;
      case 'offline': return theme.textSecondary;
      default: return theme.textSecondary;
    }
  };
  
  const getStatusText = (member: Member) => {
    switch (member.status) {
      case 'online': return 'Online';
      case 'in_tournament': return 'In Tournament';
      case 'offline': return member.last_seen ? `Last seen ${formatTimeAgo(member.last_seen)}` : 'Offline';
      default: return 'Unknown';
    }
  };
  
  const renderTabButton = (tab: string, icon: string, label: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab as any)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? theme.onPrimary : theme.textSecondary}
      />
      <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  const renderPost = (post: CommunityPost) => (
    <View key={post.id} style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image
          source={{ uri: post.author_avatar || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.postHeaderText}>
          <Text style={styles.authorName}>{post.author_name}</Text>
          <Text style={styles.postTime}>{formatTimeAgo(post.created_at)}</Text>
        </View>
        <View style={[styles.postTypeBadge, { backgroundColor: getPostTypeColor(post.post_type) }]}>
          <Ionicons name={getPostTypeIcon(post.post_type) as any} size={12} color={theme.onPrimary} />
        </View>
      </View>
      
      {/* Post Content */}
      <Text style={styles.postContent}>{post.content}</Text>
      
      {/* Post Image */}
      {post.image_url && (
        <Image source={{ uri: post.image_url }} style={styles.postImage} />
      )}
      
      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLikePost(post.id)}
        >
          <Ionicons
            name={post.is_liked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.is_liked ? theme.accent : theme.textSecondary}
          />
          <Text style={styles.actionText}>{post.likes_count}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={theme.textSecondary} />
          <Text style={styles.actionText}>{post.comments_count}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleSharePost(post)}
        >
          <Ionicons name="share-outline" size={20} color={theme.textSecondary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderMember = (member: Member) => (
    <View key={member.id} style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={styles.memberAvatarContainer}>
          <Image
            source={{ uri: member.avatar_url || 'https://via.placeholder.com/50' }}
            style={styles.memberAvatar}
          />
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(member.status) }]} />
        </View>
        
        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberStatus}>{getStatusText(member)}</Text>
          <Text style={styles.memberStats}>
            Rank #{member.current_rank} • {member.total_points} points • {member.tournaments_participated} tournaments
          </Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.connectButton}>
        <Ionicons name="person-add-outline" size={18} color={theme.success} />
      </TouchableOpacity>
    </View>
  );
  
  const renderChatMessage = (message: ChatMessage) => (
    <View key={message.id} style={styles.chatMessage}>
      <Image
        source={{ uri: message.sender_avatar || 'https://via.placeholder.com/30' }}
        style={styles.chatAvatar}
      />
      <View style={styles.chatContent}>
        <View style={styles.chatMessageHeader}>
          <Text style={styles.chatSender}>{message.sender_name}</Text>
          <Text style={styles.chatTime}>{formatTimeAgo(message.timestamp)}</Text>
        </View>
        <Text style={styles.chatText}>{message.message}</Text>
      </View>
    </View>
  );
  
  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'photo': return theme.accent;
      case 'achievement': return theme.gold;
      case 'tournament_update': return theme.primaryDark;
      default: return theme.textSecondary;
    }
  };
  
  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'photo': return 'camera';
      case 'achievement': return 'trophy';
      case 'tournament_update': return 'megaphone';
      default: return 'chatbubble';
    }
  };
  
  const renderFeed = () => (
    <View style={styles.tabContent}>
      {/* Create Post Button */}
      <TouchableOpacity 
        style={styles.createPostButton}
        onPress={() => setShowNewPostModal(true)}
      >
  <Ionicons name="add-circle" size={24} color={theme.accent} />
        <Text style={styles.createPostText}>Share something with the community...</Text>
      </TouchableOpacity>
      
      {/* Posts */}
      {posts.length === 0 ? (
        <EmptyState
          icon="people"
          title="No Posts Yet"
          message="Be the first to share something with the community!"
        />
      ) : (
        <View style={styles.postsContainer}>
          {posts.map(renderPost)}
        </View>
      )}
    </View>
  );
  
  const renderMembers = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Community Members</Text>
        <Text style={styles.memberCount}>{members.length} active members</Text>
      </View>
      
      {members.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No Members Found"
          message="The community is just getting started!"
        />
      ) : (
        <View style={styles.membersContainer}>
          {members.map(renderMember)}
        </View>
      )}
    </View>
  );
  
  const renderChat = () => (
    <View style={styles.tabContent}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>Tournament Chat</Text>
        <Text style={styles.chatSubtitle}>Fall Classic 2025</Text>
      </View>
      
      <ScrollView style={styles.chatMessages}>
        {chatMessages.map(renderChatMessage)}
      </ScrollView>
      
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInputField}
          placeholder="Type a message..."
          value={chatInput}
          onChangeText={setChatInput}
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSendMessage}
        >
          <Ionicons name="send" size={20} color={theme.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity style={styles.notificationsButton}>
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>3</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTabButton('feed', 'home', 'Feed')}
          {renderTabButton('members', 'people', 'Members')}
          {renderTabButton('chat', 'chatbubbles', 'Chat')}
        </ScrollView>
      </View>
      
      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.success]}
            tintColor={theme.success}
          />
        }
      >
        {activeTab === 'feed' && renderFeed()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'chat' && renderChat()}
      </ScrollView>
      
      {/* New Post Modal */}
      <Modal
        visible={showNewPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewPostModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Post</Text>
            <TouchableOpacity onPress={handleCreatePost}>
              <Text style={styles.modalPost}>Post</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.postInput}
            placeholder="What's happening in your fishing world?"
            value={newPostText}
            onChangeText={setNewPostText}
            multiline
            autoFocus
          />
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme: BrandTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.spacing.lg,
    paddingTop: theme.layout.spacing.xxl,
    paddingBottom: theme.layout.spacing.md,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h1,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
  },
  notificationsButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: theme.onPrimary,
    fontSize: 12,
    fontFamily: theme.typography.family.bold,
  },
  tabNavigation: {
    backgroundColor: theme.surface,
    paddingVertical: theme.layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.layout.spacing.xl,
    paddingVertical: theme.layout.spacing.sm,
    marginHorizontal: theme.layout.spacing.sm,
    borderRadius: theme.layout.radius.xl,
    backgroundColor: theme.mode === 'light' ? theme.card : theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeTabButton: {
    backgroundColor: theme.components.buttonPrimary.filled.backgroundColor,
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
    elevation: theme.glow.subtle.elevation,
  },
  tabLabel: {
    marginLeft: theme.layout.spacing.sm,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.medium,
    color: theme.textSecondary,
  },
  activeTabLabel: {
    color: theme.onPrimary,
    fontFamily: theme.typography.family.bold,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: theme.layout.spacing.xl,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: theme.layout.spacing.md,
    borderRadius: theme.layout.radius.md,
    marginBottom: theme.layout.spacing.xxl,
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
    elevation: theme.glow.subtle.elevation,
    borderWidth: 1,
    borderColor: theme.border,
  },
  createPostText: {
    marginLeft: theme.layout.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.textSecondary,
    flex: 1,
  },
  postsContainer: {
    gap: theme.layout.spacing.md,
  },
  postCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.layout.radius.lg,
    padding: theme.layout.spacing.lg,
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
    elevation: theme.glow.subtle.elevation,
    borderWidth: 1,
    borderColor: theme.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.layout.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postHeaderText: {
    flex: 1,
    marginLeft: theme.layout.spacing.md,
  },
  authorName: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
  },
  postTime: {
    fontSize: theme.typography.sizes.caption,
    color: theme.textSecondary,
    marginTop: 2,
  },
  postTypeBadge: {
    padding: theme.layout.spacing.xs,
    borderRadius: theme.layout.radius.xl,
  },
  postContent: {
    fontSize: theme.typography.sizes.body,
    color: theme.text,
    lineHeight: 24,
    marginBottom: theme.layout.spacing.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.layout.radius.md,
    marginBottom: theme.layout.spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.divider,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.layout.spacing.xs,
    paddingHorizontal: theme.layout.spacing.md,
    marginRight: theme.layout.spacing.lg,
  },
  actionText: {
    marginLeft: theme.layout.spacing.xs,
    fontSize: theme.typography.sizes.body,
    color: theme.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.layout.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
  },
  memberCount: {
    fontSize: theme.typography.sizes.caption,
    color: theme.textSecondary,
  },
  membersContainer: {
    gap: theme.layout.spacing.md,
  },
  memberCard: {
    backgroundColor: theme.surface,
    padding: theme.layout.spacing.lg,
    borderRadius: theme.layout.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
    elevation: theme.glow.subtle.elevation,
    borderWidth: 1,
    borderColor: theme.border,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatarContainer: {
    position: 'relative',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.surface,
  },
  memberDetails: {
    flex: 1,
    marginLeft: theme.layout.spacing.md,
  },
  memberName: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginBottom: 4,
  },
  memberStatus: {
    fontSize: theme.typography.sizes.caption,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  memberStats: {
    fontSize: theme.typography.sizes.caption,
    color: theme.textSecondary,
  },
  connectButton: {
    padding: theme.layout.spacing.sm,
  },
  chatHeader: {
    backgroundColor: theme.surface,
    padding: theme.layout.spacing.md,
    borderRadius: theme.layout.radius.md,
    marginBottom: theme.layout.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  chatTitle: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
  },
  chatSubtitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.textSecondary,
    marginTop: 4,
  },
  chatMessages: {
    flex: 1,
    marginBottom: theme.layout.spacing.md,
  },
  chatMessage: {
    flexDirection: 'row',
    marginBottom: theme.layout.spacing.md,
  },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: theme.layout.spacing.sm,
  },
  chatContent: {
    flex: 1,
    backgroundColor: theme.surface,
    padding: theme.layout.spacing.md,
    borderRadius: theme.layout.radius.md,
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
    elevation: theme.glow.subtle.elevation,
    borderWidth: 1,
    borderColor: theme.border,
  },
  chatMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatSender: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
  },
  chatTime: {
    fontSize: theme.typography.sizes.caption,
    color: theme.textSecondary,
  },
  chatText: {
    fontSize: theme.typography.sizes.body,
    color: theme.text,
    lineHeight: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.surface,
    borderRadius: theme.layout.radius.xl,
    paddingHorizontal: theme.layout.spacing.md,
    paddingVertical: theme.layout.spacing.sm,
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
    elevation: theme.glow.subtle.elevation,
    borderWidth: 1,
    borderColor: theme.border,
  },
  chatInputField: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: theme.components.buttonPrimary.filled.backgroundColor,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.layout.spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
    paddingTop: 50,
    backgroundColor: theme.surface,
  },
  modalCancel: {
    fontSize: theme.typography.sizes.body,
    color: theme.textSecondary,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
  },
  modalPost: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.bold,
    color: theme.primary,
  },
  postInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    padding: 20,
    textAlignVertical: 'top',
    color: theme.text,
  },
});

export default SocialScreen;
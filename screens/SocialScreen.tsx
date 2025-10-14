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
import { fishingTheme, spacing, borderRadius, fontSize, fontWeight, shadows } from '../lib/designTokens';

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
      case 'online': return '#4CAF50';
      case 'in_tournament': return '#FF9800';
      case 'offline': return '#757575';
      default: return '#757575';
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
        color={activeTab === tab ? fishingTheme.colors.white : '#666'}
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
          <Ionicons name={getPostTypeIcon(post.post_type) as any} size={12} color={fishingTheme.colors.white} />
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
            name={post.is_liked ? "heart" : "heart-outline"}
            size={20}
            color={post.is_liked ? "#E91E63" : fishingTheme.colors.mutedWhite}
          />
          <Text style={styles.actionText}>{post.likes_count}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={fishingTheme.colors.mutedWhite} />
          <Text style={styles.actionText}>{post.comments_count}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleSharePost(post)}
        >
          <Ionicons name="share-outline" size={20} color={fishingTheme.colors.mutedWhite} />
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
        <Ionicons name="person-add-outline" size={18} color="#4CAF50" />
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
      case 'photo': return fishingTheme.colors.lightTeal;
      case 'achievement': return fishingTheme.colors.mutedGold;
      case 'tournament_update': return fishingTheme.colors.deepOcean;
      default: return '#9E9E9E';
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
        <Ionicons name="add-circle" size={24} color={fishingTheme.colors.lightTeal} />
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
          <Ionicons name="send" size={20} color="#fff" />
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
          <Ionicons name="notifications-outline" size={24} color="#333" />
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
            colors={['#4CAF50']}
            tintColor="#4CAF50"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.giant,
    paddingBottom: spacing.md,
    backgroundColor: fishingTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold as any,
    color: '#13323b',
  },
  notificationsButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E91E63',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabNavigation: {
    backgroundColor: fishingTheme.colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.xxl,
    backgroundColor: '#f5f5f5',
  },
  activeTabButton: {
    backgroundColor: fishingTheme.colors.lightTeal,
  },
  tabLabel: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium as any,
    color: '#666',
  },
  activeTabLabel: {
    color: fishingTheme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.xl,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: fishingTheme.colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xxl,
    ...shadows.sm,
  },
  createPostText: {
    marginLeft: spacing.md,
    fontSize: fontSize.md,
    color: fishingTheme.colors.mutedWhite,
    flex: 1,
  },
  postsContainer: {
    gap: 15,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  postTypeBadge: {
    padding: spacing.xs + 2,
    borderRadius: borderRadius.xl,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    marginRight: spacing.lg,
  },
  actionText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.md,
    color: fishingTheme.colors.mutedWhite,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
  },
  membersContainer: {
    gap: 12,
  },
  memberCard: {
    backgroundColor: fishingTheme.colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
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
    borderColor: '#fff',
  },
  memberDetails: {
    flex: 1,
    marginLeft: 15,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memberStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  memberStats: {
    fontSize: 12,
    color: '#999',
  },
  connectButton: {
    padding: spacing.sm,
  },
  chatHeader: {
    backgroundColor: fishingTheme.colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: '#13323b',
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chatMessages: {
    flex: 1,
    marginBottom: 15,
  },
  chatMessage: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  chatContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  chatMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: fishingTheme.colors.white,
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  chatInputField: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: fishingTheme.colors.lightTeal,
    borderRadius: borderRadius.circle,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalPost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  postInput: {
    flex: 1,
    fontSize: 18,
    padding: 20,
    textAlignVertical: 'top',
  },
});

export default SocialScreen;
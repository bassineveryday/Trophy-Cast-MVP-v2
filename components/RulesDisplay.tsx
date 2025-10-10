import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { loadTournamentRules } from '../utils/rulesLoader';

interface RulesDisplayProps {
  markdownContent?: string;
}

const RulesDisplay: React.FC<RulesDisplayProps> = ({ markdownContent }) => {
  const [content, setContent] = useState<string>('Loading...');

  useEffect(() => {
    if (markdownContent) {
      setContent(markdownContent);
    } else {
      loadRules();
    }
  }, [markdownContent]);

  const loadRules = async () => {
    try {
      const rules = await loadTournamentRules();
      setContent(rules);
    } catch (error) {
      console.error('Error loading rules:', error);
      setContent('# Error loading tournament rules\nPlease try again later.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Markdown style={{
        body: { color: '#333' },
        heading1: { color: '#003366', fontSize: 24, marginBottom: 10 },
        heading2: { color: '#004080', fontSize: 20, marginTop: 20, marginBottom: 10 },
        heading3: { color: '#004080', fontSize: 18, marginTop: 15, marginBottom: 8 },
        paragraph: { fontSize: 16, lineHeight: 24, marginBottom: 10 },
        list: { marginBottom: 10 },
        listItem: { marginBottom: 5 },
        table: { borderWidth: 1, borderColor: '#ddd', marginVertical: 10 },
        tableHeaderCell: { backgroundColor: '#f5f5f5', padding: 8 },
        tableCell: { padding: 8 },
        em: { fontStyle: 'italic' },
        strong: { fontWeight: 'bold' },
        blockquote: { borderLeftWidth: 4, borderLeftColor: '#ddd', paddingLeft: 10 },
        code: { fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: 2 },
        codeBlock: { 
          backgroundColor: '#f5f5f5', 
          padding: 10, 
          marginVertical: 10,
          fontFamily: 'monospace',
        },
      }}>
        {content}
      </Markdown>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
  },
});

export default RulesDisplay;
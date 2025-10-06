import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// propsの型定義 (TypeScriptを使用する場合)
interface TextStrokeProps {
  text: string;
  strokeWidth: number;
  strokeColor: string;
  style?: object; // テキスト本体のスタイル
}

const TextStroke: React.FC<TextStrokeProps> = ({ text, strokeWidth, strokeColor, style }) => {
  const textStyle = StyleSheet.flatten(style) || {};

  // 縁取り用のテキストスタイル
  const strokeLayerStyle = {
    ...textStyle,
    color: strokeColor, // 縁取りの色で上書き
    position: 'absolute' as const,
  };

  // 8方向のオフセット
  const offsets = [
    { top: -strokeWidth, left: -strokeWidth },
    { top: -strokeWidth, left: 0 },
    { top: -strokeWidth, left: strokeWidth },
    { top: 0, left: -strokeWidth },
    { top: 0, left: strokeWidth },
    { top: strokeWidth, left: -strokeWidth },
    { top: strokeWidth, left: 0 },
    { top: strokeWidth, left: strokeWidth },
  ];

  return (
    <View>
      {/* 背景の縁取り用テキスト */}
      {offsets.map((offset, index) => (
        <Text
          key={index}
          style={[
            strokeLayerStyle,
            { top: offset.top, left: offset.left },
          ]}
          // アクセシビリティのため、スクリーンリーダーには読ませない
          aria-hidden={true}
        >
          {text}
        </Text>
      ))}
      {/* 前景のメインテキスト */}
      <Text style={textStyle}>{text}</Text>
    </View>
  );
};

export default TextStroke;
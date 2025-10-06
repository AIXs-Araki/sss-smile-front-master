#!/usr/bin/env ruby

require 'yaml'

# --- メイン処理 ---

# 引数が足りない場合に使い方を表示して終了
def print_usage_and_exit
  puts "--------------------------------------------------"
  puts "OpenAPI YAML Parser"
  puts "--------------------------------------------------"
  puts "Usage:"
  puts "  ruby #{__FILE__} list"
  puts "  ruby #{__FILE__} show <path>"
  puts
  puts "Commands:"
  puts "  list: List all endpoints and their methods."
  puts "  show: Show details for a specific endpoint path."
  puts
  puts "Note: Uses ./api.yaml as the input file."
  puts "--------------------------------------------------"
  exit 1
end

# 'list' コマンドの処理
def command_list(data)
  puts "API Endpoints List:"
  puts "==================="
  
  paths = data['paths']
  unless paths
    puts "Error: 'paths' key not found in the YAML file."
    return
  end
  
  paths.each do |path, methods|
    # `get`, `put`, `post`, `delete` などのキーを大文字にして結合
    method_list = methods.keys.map(&:upcase).join(', ')
    puts "#{path}: #{method_list}"
  end
end

# 'show' コマンドの処理
def command_show(data, target_path)
  path_details = data.dig('paths', target_path)

  unless path_details
    puts "Error: Path '#{target_path}' not found in the YAML file."
    exit 1
  end

  puts "Details for: #{target_path}"
  puts "========================================"

  path_details.each do |method, details|
    puts "\n--- Method: #{method.upcase} ---"
    puts "  Summary: #{details['summary'] || 'N/A'}"

    # パラメータの表示
    if details['parameters'] && !details['parameters'].empty?
      puts "  Parameters:"
      details['parameters'].each do |param|
        description = param['description'] ? param['description'].gsub(/\n/, ' ') : 'N/A'
        puts "    - Name: #{param['name']}"
        puts "      In:   #{param['in']}"
        puts "      Desc: #{description}"
      end
    else
      puts "  Parameters: None"
    end

    # レスポンスの表示
    if details['responses']
      puts "  Responses:"
      
      # 200レスポンスがある場合の詳細表示
      if details['responses']['200']
        response_200 = details['responses']['200']
        puts "    200 (Success):"
        puts "      Description: #{response_200['description'] || 'N/A'}"
        
        # コンテンツタイプとスキーマの表示
        if response_200['content']
          response_200['content'].each do |content_type, content_details|
            puts "      Content-Type: #{content_type}"
            
            if content_details['schema']
              schema = content_details['schema']
              puts "      Schema:"
              display_schema(schema, 8, data)
            end
          end
        end
      end
      
      # その他のレスポンスコードも表示
      details['responses'].each do |status_code, response_details|
        next if status_code == '200'  # 200は上で詳細表示済み
        puts "    #{status_code}: #{response_details['description'] || 'N/A'}"
      end
    else
      puts "  Responses: None defined"
    end
  end
  puts "========================================"
end

# スキーマを再帰的に表示するヘルパー関数
def display_schema(schema, indent = 0, api_data = nil)
  indent_str = ' ' * indent
  
  # $ref参照を解決
  if schema['$ref']
    puts "#{indent_str}Reference: #{schema['$ref']}"
    resolved_schema = resolve_ref(schema['$ref'], api_data)
    if resolved_schema
      puts "#{indent_str}Resolved content:"
      display_schema(resolved_schema, indent + 2, api_data)
    else
      puts "#{indent_str}Error: Could not resolve reference"
    end
    return
  end
  
  # allOf, oneOf, anyOfの処理
  if schema['allOf']
    puts "#{indent_str}AllOf (combines all schemas):"
    schema['allOf'].each_with_index do |sub_schema, index|
      puts "#{indent_str}  Schema #{index + 1}:"
      display_schema(sub_schema, indent + 4, api_data)
    end
    return
  end
  
  if schema['oneOf']
    puts "#{indent_str}OneOf (matches one schema):"
    schema['oneOf'].each_with_index do |sub_schema, index|
      puts "#{indent_str}  Option #{index + 1}:"
      display_schema(sub_schema, indent + 4, api_data)
    end
    return
  end
  
  if schema['anyOf']
    puts "#{indent_str}AnyOf (matches any schema):"
    schema['anyOf'].each_with_index do |sub_schema, index|
      puts "#{indent_str}  Option #{index + 1}:"
      display_schema(sub_schema, indent + 4, api_data)
    end
    return
  end
  
  case schema['type']
  when 'object'
    puts "#{indent_str}Type: object"
    puts "#{indent_str}Description: #{schema['description']}" if schema['description']
    
    if schema['properties']
      puts "#{indent_str}Properties:"
      schema['properties'].each do |prop_name, prop_schema|
        puts "#{indent_str}  #{prop_name}:"
        display_schema(prop_schema, indent + 4, api_data)
      end
    end
    
    if schema['required']
      puts "#{indent_str}Required: #{schema['required'].join(', ')}"
    end
    
  when 'array'
    puts "#{indent_str}Type: array"
    puts "#{indent_str}Description: #{schema['description']}" if schema['description']
    if schema['items']
      puts "#{indent_str}Items:"
      display_schema(schema['items'], indent + 2, api_data)
    end
    
  when 'string', 'integer', 'number', 'boolean'
    type_info = "Type: #{schema['type']}"
    type_info += " (format: #{schema['format']})" if schema['format']
    type_info += " (enum: #{schema['enum'].join(', ')})" if schema['enum']
    puts "#{indent_str}#{type_info}"
    puts "#{indent_str}Description: #{schema['description']}" if schema['description']
    
  else
    puts "#{indent_str}Type: #{schema['type'] || 'unknown'}"
    puts "#{indent_str}Description: #{schema['description']}" if schema['description']
  end
end

# $ref参照を解決するヘルパー関数
def resolve_ref(ref_path, api_data)
  return nil unless api_data && ref_path
  
  # OpenAPI 3.x形式の参照パス（例: "#/components/schemas/GeneralResponse200"）を解析
  if ref_path.start_with?('#/')
    path_parts = ref_path[2..-1].split('/')
    
    current = api_data
    path_parts.each do |part|
      return nil unless current.is_a?(Hash) && current.key?(part)
      current = current[part]
    end
    
    return current
  end
  
  nil
end


# --- スクリプト実行開始 ---

command = ARGV[0]
filename = './api.yaml'

# 引数のチェック
print_usage_and_exit if ARGV.length < 1 || !['list', 'show'].include?(command)

# ファイルの存在チェック
unless File.exist?(filename)
  puts "Error: File not found at '#{filename}'"
  exit 1
end

# YAMLファイルの読み込みとパース
begin
  api_data = YAML.load_file(filename)
rescue Psych::SyntaxError => e
  puts "Error: Invalid YAML syntax in '#{filename}'"
  puts e.message
  exit 1
end


# コマンドに応じて処理を分岐
case command
when 'list'
  command_list(api_data)
when 'show'
  target_path = ARGV[1]
  if target_path.nil?
    puts "Error: Please specify a path for the 'show' command."
    print_usage_and_exit
  end
  command_show(api_data, target_path)
end

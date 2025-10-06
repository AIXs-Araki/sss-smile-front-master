import { useRef, useState, useCallback } from 'react';
import Downshift from 'downshift';
import { Input } from './ui/input';

export type AutocompleteOption = { id: string | number, name: string };

type Props = {
  placeholder?: string;
  onSelect?: (selection: AutocompleteOption) => void;
  // APIを呼び出す関数をpropsとして受け取るように変更
  fetchSuggestions: (keyword: string) => Promise<AutocompleteOption[]>;
};

export function AutocompleteWithApi(props: Props) {
  const [items, setItems] = useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  // useRefを使ってデバウンス処理中のタイマーを管理
  const debounceTimer = useRef<NodeJS.Timeout>(null);

  const bottomPosition = ref.current ? getBottomY(ref.current) : 600;
  const { fetchSuggestions } = props;
  // useCallbackで関数をメモ化し、不要な再生成を防ぐ
  const fetchItems = useCallback(async (inputValue: string | null) => {
    if (!inputValue) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const results = await fetchSuggestions(inputValue);
      setItems(results);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setItems([]); // エラー時はリストを空にする
    } finally {
      setLoading(false);
    }
  }, [fetchSuggestions]);

  return (
    <Downshift
      onChange={selection => {
        setIsOpened(false);
        if (props.onSelect && selection) {
          props.onSelect(selection);
        }
      }}
      onInputValueChange={inputValue => {
        // デバウンス処理
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          fetchItems(inputValue);
        }, 500); // 500ms入力がなければAPIを叩く
      }}
      itemToString={item => (item ? item.name : '')}
      isOpen={isOpened}
    >
      {({
        getInputProps,
        getItemProps,
        getMenuProps,
        isOpen,
        highlightedIndex,
        selectedItem,
        getRootProps,
        inputValue, // inputValueを取得してローディングや結果なしの判定に利用
      }) => (
        <div>
          <div
            className="w-full "
            style={{ display: 'inline-block' }}
            {...getRootProps({}, { suppressRefError: true })}
          >
            <Input
              {...getInputProps()}
              className="p-2 rounded-md w-full border border-input"
              placeholder={props.placeholder}
              onFocus={() => setIsOpened(true)}
              // onBlurでメニューを閉じると、項目クリックができない場合があるためDownshiftに任せるのが安全
              onBlur={() => setTimeout(() => setIsOpened(false), 150)}
              ref={ref}
            />
          </div>
          {isOpen ? (
            <ul
              {...getMenuProps()}
              className="absolute overflow-y-scroll rounded-md shadow-lg bg-white text-sm"
              style={{ maxHeight: `calc(100vh - ${bottomPosition}px - 50px)`, width: 600 }}
            >
              {loading ? (
                <li className="px-2 py-2 text-gray-500">ローディング中...</li>
              ) : items.length > 0 ? (
                items.map((item, index) => (
                  <li
                    className="px-2 py-2 text-left cursor-pointer "
                    {...getItemProps({
                      key: item.id, // keyにはユニークなidを使用
                      index,
                      item,
                      style: {
                        backgroundColor: highlightedIndex === index ? 'lightgray' : 'white',
                        fontWeight: selectedItem === item ? 'bold' : 'normal',
                      },
                    })}
                  >
                    {item.name}
                  </li>
                ))
              ) : (
                // 入力があるのに結果が0件の場合にメッセージを表示
                inputValue && !loading && (
                  <li className="px-2 py-2 text-gray-500">結果が見つかりません</li>
                )
              )}
            </ul>
          ) : null}
        </div>
      )}
    </Downshift>
  );
}

const getBottomY = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  return top + element.offsetHeight;
};
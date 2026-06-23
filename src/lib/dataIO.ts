import { useTaskStore } from '@/stores/taskStore';
import { useOngoingStore } from '@/stores/ongoingStore';
import { useEnergyStore } from '@/stores/energyStore';
import { useSentenceStore } from '@/stores/sentenceStore';
import { useReviewStore } from '@/stores/reviewStore';
import { toLocalDate } from '@/lib/dateUtils';

interface ExportData {
  version: 1;
  exportedAt: string;
  tasks: ReturnType<typeof useTaskStore.getState>['tasks'];
  ongoing: ReturnType<typeof useOngoingStore.getState>['items'];
  energy: ReturnType<typeof useEnergyStore.getState>['records'];
  sentences: ReturnType<typeof useSentenceStore.getState>['sentences'];
  reviews: ReturnType<typeof useReviewStore.getState>['reviews'];
}

function getExportData(): ExportData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks: useTaskStore.getState().tasks,
    ongoing: useOngoingStore.getState().items,
    energy: useEnergyStore.getState().records,
    sentences: useSentenceStore.getState().sentences,
    reviews: useReviewStore.getState().reviews,
  };
}

export function exportData(): void {
  const data = getExportData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const date = toLocalDate(new Date());
  a.download = `橘猫数据_${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** 桌面端自动导出数据到指定路径 */
export async function autoExportToDesktop(): Promise<void> {
  if (!window.electronAPI?.isElectron) return;
  try {
    const data = getExportData();
    const json = JSON.stringify(data, null, 2);
    // 路径由 Electron 主进程决定，不硬编码在客户端代码中
    const result = await window.electronAPI.saveDataFile('auto-export', json);
    if (!result.success) {
      console.error('自动导出失败:', result.error);
    }
  } catch (err) {
    console.error('自动导出异常:', err);
  }
}

export function importData(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ExportData;

        if (!data.version || !data.tasks || !data.energy) {
          resolve({ success: false, message: '文件格式不正确' });
          return;
        }

        // 合并数据：导入的数据追加到现有数据中，按 id 去重
        const taskStore = useTaskStore.getState();
        const ongoingStore = useOngoingStore.getState();
        const energyStore = useEnergyStore.getState();
        const sentenceStore = useSentenceStore.getState();
        const reviewStore = useReviewStore.getState();

        const mergeById = <T extends { id: string }>(existing: T[], incoming: T[]): T[] => {
          const existingIds = new Set(existing.map((item) => item.id));
          const newItems = incoming.filter((item) => !existingIds.has(item.id));
          return [...existing, ...newItems];
        };

        useTaskStore.setState({ tasks: mergeById(taskStore.tasks, data.tasks) });
        useOngoingStore.setState({ items: mergeById(ongoingStore.items, data.ongoing || []) });
        useEnergyStore.setState({ records: mergeById(energyStore.records, data.energy) });
        useSentenceStore.setState({ sentences: mergeById(sentenceStore.sentences, data.sentences || []) });
        useReviewStore.setState({ reviews: mergeById(reviewStore.reviews, data.reviews || []) });

        resolve({ success: true, message: '导入成功' });
      } catch {
        resolve({ success: false, message: '文件解析失败，请检查文件格式' });
      }
    };
    reader.readAsText(file);
  });
}

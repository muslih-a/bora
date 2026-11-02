import React, { useState, useEffect } from 'react';
import { UserSettings, TestRecord, getSettings, getBatches, getActiveBatch, getAllTests, saveTest } from './data/db.ts';
import { BatchCalibration, DEMO_BATCH } from './core/config.ts';
import { PipelineResult } from './core/pipeline.ts';
import { MainTab, BottomNav } from './components/BottomNav.tsx';

// Screens S01..S20
import { S01Splash } from './screens/S01Splash.tsx';
import { S02Home } from './screens/S02Home.tsx';
import { S03FoodType } from './screens/S03FoodType.tsx';
import { S04PrepChecklist } from './screens/S04PrepChecklist.tsx';
import { S05Dip } from './screens/S05Dip.tsx';
import { S06WaitTimer } from './screens/S06WaitTimer.tsx';
import { S07Scan } from './screens/S07Scan.tsx';
import { S08Analysing } from './screens/S08Analysing.tsx';
import { S09RescanNeeded } from './screens/S09RescanNeeded.tsx';
import { S10Result0 } from './screens/S10Result0.tsx';
import { S11Result12 } from './screens/S11Result12.tsx';
import { S12AmmoniaStep } from './screens/S12AmmoniaStep.tsx';
import { S13ResultBPlus } from './screens/S13ResultBPlus.tsx';
import { S14ResultBMinus } from './screens/S14ResultBMinus.tsx';
import { S15BatchQR } from './screens/S15BatchQR.tsx';
import { S16ReportBPOM } from './screens/S16ReportBPOM.tsx';
import { S17History } from './screens/S17History.tsx';
import { S18HistoryDetail } from './screens/S18HistoryDetail.tsx';
import { S19Guide } from './screens/S19Guide.tsx';
import { S20Settings } from './screens/S20Settings.tsx';

export type ScreenId =
  | 'S01' // Splash
  | 'S02' // Home
  | 'S03' // Food Type
  | 'S04' // Prep Checklist
  | 'S05' // Dip 5s
  | 'S06' // Wait 10m
  | 'S07' // Scan
  | 'S08' // Analysing
  | 'S09' // Rescan Needed
  | 'S10' // Result 0
  | 'S11' // Result 1 / 2
  | 'S12' // Ammonia Step
  | 'S13' // Result B+
  | 'S14' // Result B-
  | 'S15' // Batch QR
  | 'S16' // Report BPOM
  | 'S17' // History
  | 'S18' // History Detail
  | 'S19' // Guide
  | 'S20'; // Settings

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('S02');
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [settings, setSettings] = useState<UserSettings>({
    lang: 'id',
    soundEnabled: true,
    vibrationEnabled: true,
    largeText: false,
    highContrast: false,
    defaultReporterName: '',
    researchMode: false,
  });
  const [activeBatch, setActiveBatchState] = useState<BatchCalibration>(DEMO_BATCH);
  const [lastTest, setLastTest] = useState<TestRecord | undefined>(undefined);

  // Active Test Workflow State
  const [testFoodType, setTestFoodType] = useState<string>('Bakso');
  const [testNote, setTestNote] = useState<string | undefined>(undefined);
  const [capturedImageData, setCapturedImageData] = useState<ImageData | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string>('');
  const [isAmmoniaScan, setIsAmmoniaScan] = useState<boolean>(false);
  const [initialPipelineResult, setInitialPipelineResult] = useState<PipelineResult | null>(null);
  const [ammoniaPipelineResult, setAmmoniaPipelineResult] = useState<PipelineResult | null>(null);
  const [ammoniaPhotoUrl, setAmmoniaPhotoUrl] = useState<string>('');
  const [qualityFailureResult, setQualityFailureResult] = useState<PipelineResult | null>(null);
  const [selectedHistoryTest, setSelectedHistoryTest] = useState<TestRecord | null>(null);

  // Load Initial Settings & Data
  useEffect(() => {
    async function init() {
      const storedSettings = await getSettings();
      setSettings(storedSettings);

      const batch = await getActiveBatch();
      setActiveBatchState(batch);

      const allTests = await getAllTests();
      if (allTests.length > 0) {
        setLastTest(allTests[0]);
      }

      // Check onboarding key
      const hasSeenOnboarding = localStorage.getItem('borascan_onboarding_done');
      if (!hasSeenOnboarding) {
        setCurrentScreen('S01');
      }
    }
    init();
  }, []);

  const refreshData = async () => {
    const batch = await getActiveBatch();
    setActiveBatchState(batch);
    const allTests = await getAllTests();
    if (allTests.length > 0) {
      setLastTest(allTests[0]);
    } else {
      setLastTest(undefined);
    }
  };

  const handleTabChange = (tab: MainTab) => {
    setCurrentTab(tab);
    if (tab === 'home') setCurrentScreen('S02');
    else if (tab === 'history') setCurrentScreen('S17');
    else if (tab === 'guide') setCurrentScreen('S19');
    else if (tab === 'settings') setCurrentScreen('S20');
  };

  const saveCurrentTest = async (category: '0' | '1' | '2' | 'B+' | 'B-') => {
    if (!initialPipelineResult) return;
    const testRecord: TestRecord = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      foodType: testFoodType,
      note: testNote,
      batchId: activeBatch.batch,
      category,
      isAmmoniaDone: isAmmoniaScan,
      estimate: initialPipelineResult.estimate,
      initialPhotoDataUrl: capturedPhotoUrl,
      ammoniaPhotoDataUrl: ammoniaPhotoUrl || undefined,
      initialPipelineResult,
      ammoniaPipelineResult: ammoniaPipelineResult || undefined,
    };
    await saveTest(testRecord);
    await refreshData();
    setCurrentScreen('S02');
    setCurrentTab('home');
  };

  // Render Screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'S01':
        return (
          <S01Splash
            lang={settings.lang}
            onFinish={() => {
              localStorage.setItem('borascan_onboarding_done', 'true');
              setCurrentScreen('S02');
              setCurrentTab('home');
            }}
          />
        );

      case 'S02':
        return (
          <S02Home
            lang={settings.lang}
            activeBatch={activeBatch}
            lastTest={lastTest}
            onStartNewTest={() => {
              setIsAmmoniaScan(false);
              setInitialPipelineResult(null);
              setAmmoniaPipelineResult(null);
              setAmmoniaPhotoUrl('');
              setCurrentScreen('S03');
            }}
            onOpenBatchQR={() => setCurrentScreen('S15')}
            onOpenHistory={() => handleTabChange('history')}
            onOpenGuide={() => handleTabChange('guide')}
            onOpenBPOMInfo={() => setCurrentScreen('S19')}
            onOpenLastTest={() => {
              if (lastTest) {
                setSelectedHistoryTest(lastTest);
                setCurrentScreen('S18');
              }
            }}
          />
        );

      case 'S03':
        return (
          <S03FoodType
            lang={settings.lang}
            onBack={() => setCurrentScreen('S02')}
            onNext={(food, note) => {
              setTestFoodType(food);
              setTestNote(note);
              setCurrentScreen('S04');
            }}
          />
        );

      case 'S04':
        return (
          <S04PrepChecklist
            lang={settings.lang}
            onBack={() => setCurrentScreen('S03')}
            onNext={() => setCurrentScreen('S05')}
          />
        );

      case 'S05':
        return (
          <S05Dip
            lang={settings.lang}
            onBack={() => setCurrentScreen('S04')}
            onDone={() => setCurrentScreen('S06')}
          />
        );

      case 'S06':
        return (
          <S06WaitTimer
            lang={settings.lang}
            researchMode={settings.researchMode}
            onBack={() => setCurrentScreen('S05')}
            onReadyToScan={() => {
              setIsAmmoniaScan(false);
              setCurrentScreen('S07');
            }}
          />
        );

      case 'S07':
        return (
          <S07Scan
            lang={settings.lang}
            isAmmoniaMode={isAmmoniaScan}
            onBack={() => {
              if (isAmmoniaScan) setCurrentScreen('S12');
              else setCurrentScreen('S06');
            }}
            onCapture={(imgData, photoUrl) => {
              setCapturedImageData(imgData);
              if (isAmmoniaScan) {
                setAmmoniaPhotoUrl(photoUrl);
              } else {
                setCapturedPhotoUrl(photoUrl);
              }
              setCurrentScreen('S08');
            }}
          />
        );

      case 'S08':
        if (!capturedImageData) return null;
        return (
          <S08Analysing
            lang={settings.lang}
            imageData={capturedImageData}
            batch={activeBatch}
            isAmmoniaScan={isAmmoniaScan}
            firstScanPadLab={initialPipelineResult?.correctedPadLab}
            onAnalysisSuccess={(result) => {
              if (!isAmmoniaScan) {
                setInitialPipelineResult(result);
                if (result.category === '0') {
                  setCurrentScreen('S10');
                } else {
                  setCurrentScreen('S11');
                }
              } else {
                setAmmoniaPipelineResult(result);
                if (result.category === 'B+') {
                  setCurrentScreen('S13');
                } else {
                  setCurrentScreen('S14');
                }
              }
            }}
            onAnalysisFailure={(res) => {
              setQualityFailureResult(res);
              setCurrentScreen('S09');
            }}
          />
        );

      case 'S09':
        return (
          <S09RescanNeeded
            lang={settings.lang}
            quality={
              qualityFailureResult?.quality || {
                passed: false,
                code: 'FEW_MARKERS',
                reasonId: 'Kartu tidak terlihat penuh',
                reasonEn: 'Card not fully visible',
                fixId: 'Pastikan 4 sudut kartu masuk ke bingkai panduan',
                fixEn: 'Ensure all 4 corners are inside the guide frame',
                metrics: {
                  markerCount: 0,
                  minMarkerSidePx: 0,
                  laplacianVariance: 0,
                  glarePadPct: 0,
                  glareWPct: 0,
                  meanGW: 0,
                  padDeltaEFromW: 0,
                  padSdG: 0,
                },
              }
            }
            onRescan={() => setCurrentScreen('S07')}
            onCancel={() => setCurrentScreen('S02')}
          />
        );

      case 'S10':
        if (!initialPipelineResult) return null;
        return (
          <S10Result0
            lang={settings.lang}
            foodType={testFoodType}
            pipelineResult={initialPipelineResult}
            photoDataUrl={capturedPhotoUrl}
            batchId={activeBatch.batch}
            researchMode={settings.researchMode}
            onSave={() => saveCurrentTest('0')}
            onTestAgain={() => {
              setCurrentScreen('S02');
              setCurrentTab('home');
            }}
          />
        );

      case 'S11':
        if (!initialPipelineResult) return null;
        return (
          <S11Result12
            lang={settings.lang}
            foodType={testFoodType}
            pipelineResult={initialPipelineResult}
            photoDataUrl={capturedPhotoUrl}
            batchId={activeBatch.batch}
            researchMode={settings.researchMode}
            onProceedToAmmonia={() => {
              setIsAmmoniaScan(true);
              setCurrentScreen('S12');
            }}
          />
        );

      case 'S12':
        return (
          <S12AmmoniaStep
            lang={settings.lang}
            researchMode={settings.researchMode}
            onBack={() => setCurrentScreen('S11')}
            onReadyToScanAmmonia={() => {
              setIsAmmoniaScan(true);
              setCurrentScreen('S07');
            }}
          />
        );

      case 'S13':
        if (!initialPipelineResult || !ammoniaPipelineResult) return null;
        return (
          <S13ResultBPlus
            lang={settings.lang}
            foodType={testFoodType}
            initialResult={initialPipelineResult}
            ammoniaResult={ammoniaPipelineResult}
            initialPhotoUrl={capturedPhotoUrl}
            ammoniaPhotoUrl={ammoniaPhotoUrl}
            batchId={activeBatch.batch}
            researchMode={settings.researchMode}
            onReportBPOM={() => setCurrentScreen('S16')}
            onSave={() => saveCurrentTest('B+')}
            onTestAgain={() => {
              setCurrentScreen('S02');
              setCurrentTab('home');
            }}
          />
        );

      case 'S14':
        if (!initialPipelineResult || !ammoniaPipelineResult) return null;
        return (
          <S14ResultBMinus
            lang={settings.lang}
            foodType={testFoodType}
            initialResult={initialPipelineResult}
            ammoniaResult={ammoniaPipelineResult}
            initialPhotoUrl={capturedPhotoUrl}
            ammoniaPhotoUrl={ammoniaPhotoUrl}
            batchId={activeBatch.batch}
            researchMode={settings.researchMode}
            onSave={() => saveCurrentTest('B-')}
            onTestAgain={() => {
              setCurrentScreen('S02');
              setCurrentTab('home');
            }}
          />
        );

      case 'S15':
        return (
          <S15BatchQR
            lang={settings.lang}
            onBack={() => setCurrentScreen('S02')}
            onBatchUpdated={refreshData}
          />
        );

      case 'S16':
        if (!initialPipelineResult) return null;
        return (
          <S16ReportBPOM
            lang={settings.lang}
            foodType={testFoodType}
            initialResult={initialPipelineResult}
            ammoniaResult={ammoniaPipelineResult || undefined}
            initialPhotoUrl={capturedPhotoUrl}
            batchId={activeBatch.batch}
            defaultReporterName={settings.defaultReporterName}
            onBack={() => setCurrentScreen('S13')}
          />
        );

      case 'S17':
        return (
          <S17History
            lang={settings.lang}
            onSelectTest={(item) => {
              setSelectedHistoryTest(item);
              setCurrentScreen('S18');
            }}
          />
        );

      case 'S18':
        if (!selectedHistoryTest) return null;
        return (
          <S18HistoryDetail
            lang={settings.lang}
            test={selectedHistoryTest}
            onBack={() => setCurrentScreen('S17')}
            onReportBPOM={(testItem) => {
              if (testItem.initialPipelineResult) {
                setInitialPipelineResult(testItem.initialPipelineResult);
              }
              setTestFoodType(testItem.foodType);
              setCapturedPhotoUrl(testItem.initialPhotoDataUrl || '');
              setCurrentScreen('S16');
            }}
            onDeleted={async () => {
              await refreshData();
              setCurrentScreen('S17');
            }}
          />
        );

      case 'S19':
        return <S19Guide lang={settings.lang} />;

      case 'S20':
        return (
          <S20Settings
            settings={settings}
            activeBatch={activeBatch}
            onUpdateSettings={setSettings}
            onDataCleared={refreshData}
          />
        );

      default:
        return null;
    }
  };

  const showBottomNav =
    currentScreen === 'S02' ||
    currentScreen === 'S17' ||
    currentScreen === 'S19' ||
    currentScreen === 'S20';

  return (
    <div
      className={`min-h-screen bg-brand-bg text-brand-text ${
        settings.largeText ? 'text-lg' : 'text-base'
      } ${settings.highContrast ? 'contrast-125 saturate-125' : ''}`}
    >
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-brand-bg flex flex-col">
        {renderScreen()}
        {showBottomNav && (
          <BottomNav
            currentTab={currentTab}
            onSelectTab={handleTabChange}
            lang={settings.lang}
          />
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ActiveSection, Scenario } from './types';
import { PRESET_5_CUSTOMER } from './algorithms/generator';
import { AlgorithmType } from './algorithms/runner';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SimulationView } from './components/SimulationView';
import { ComparisonView } from './components/ComparisonView';
import { AnalyticsView } from './components/AnalyticsView';
import { ScalabilityView } from './components/ScalabilityView';
import { ExplorerView } from './components/ExplorerView';
import { ReportedResultsView } from './components/ReportedResultsView';
import { PresentationView } from './components/PresentationView';
import { AboutView } from './components/AboutView';

export function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('simulation');
  const [scenario, setScenario] = useState<Scenario>(PRESET_5_CUSTOMER);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('ins-2opt');

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body with Sidebar + Active Content View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeSection={activeSection} onSelectSection={setActiveSection} />

        {/* Dynamic Section Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0b0f19]">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'simulation' && (
              <SimulationView
                scenario={scenario}
                onUpdateScenario={setScenario}
                selectedAlgorithm={selectedAlgorithm}
                onSelectAlgorithm={setSelectedAlgorithm}
              />
            )}

            {activeSection === 'comparison' && <ComparisonView scenario={scenario} />}

            {activeSection === 'analytics' && <AnalyticsView scenario={scenario} />}

            {activeSection === 'scalability' && <ScalabilityView />}

            {activeSection === 'explorer' && <ExplorerView scenario={scenario} />}

            {activeSection === 'results' && <ReportedResultsView />}

            {activeSection === 'presentation' && <PresentationView />}

            {activeSection === 'about' && <AboutView />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

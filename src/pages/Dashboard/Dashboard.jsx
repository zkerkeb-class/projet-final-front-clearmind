import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Dashboard.css';
import { Terminal, Target, Box, Zap, Globe, ShieldAlert, BarChart2, Monitor } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getUserRole } from '../../utils/auth';
import { ROLES, CHART_COLORS, OS_COLORS } from '../../utils/constants';
import Skeleton from '../../components/Skeleton/Skeleton';
import { getCriticality } from '../../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState({
    payloads: 0,
    targets: 0,
    compromised: 0,
    inProgress: 0
  });
  const [chartsData, setChartsData] = useState({
    sourcesData: [],
    vulnsData: [],
    boxDifficultyData: [],
    targetOsData: []
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const userRole = getUserRole();

  useEffect(() => {
    // 1. Chargement des statistiques internes (Rapide)
    const fetchStats = async () => {
      try {
        const promises = [api.get('/payloads')];
        if (userRole !== ROLES.GUEST) {
          promises.push(api.get('/targets'));
          promises.push(api.get('/boxes'));
        }

        const results = await Promise.all(promises);
        
        const payloadsRes = results[0];
        const targetsRes = userRole !== ROLES.GUEST ? results[1] : { data: { data: { targets: [] } } };
        const boxesRes = userRole !== ROLES.GUEST ? results[2] : { data: { data: { boxes: [] } } };

        const boxes = boxesRes.data.data.boxes || [];
        const targets = targetsRes.data.data.targets || [];

        setStats({
          payloads: payloadsRes.data.data.payloads?.length || 0,
          targets: targets.length || 0,
          compromised: boxes.filter(b => ['User-Flag', 'Root-Flag'].includes(b.status)).length,
          inProgress: boxes.filter(b => b.status === 'In-Progress').length
        });

        // --- CALCUL DES DONNÉES POUR LES NOUVEAUX GRAPHIQUES ---
        
        // 1. Difficulté des Boxes
        const difficulties = { Easy: 0, Medium: 0, Hard: 0, Insane: 0 };
        boxes.forEach(b => {
          if (difficulties[b.difficulty] !== undefined) difficulties[b.difficulty]++;
        });
        const boxDifficultyData = Object.keys(difficulties).map(key => ({ name: key, value: difficulties[key] }));

        // 2. OS des Cibles
        const osCount = {};
        targets.forEach(t => {
          const os = t.os || 'Unknown';
          osCount[os] = (osCount[os] || 0) + 1;
        });
        const targetOsData = Object.keys(osCount).map(key => ({ name: key, value: osCount[key] }));

        setChartsData(prev => ({
          ...prev,
          boxDifficultyData,
          targetOsData
        }));
      } catch (err) {
        console.error("Erreur chargement stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    // 2. Chargement des News pour les graphiques (Lent - API Externe)
    const fetchNewsData = async () => {
      try {
        const newsRes = await api.get('/news');
        const articles = newsRes.data.data.items || [];

        // 1. Données par Source (Pie Chart 1)
        const sourceCount = {};
        articles.forEach(a => {
            sourceCount[a.source] = (sourceCount[a.source] || 0) + 1;
        });
        const sourcesData = Object.keys(sourceCount).map(source => ({
            name: source,
            value: sourceCount[source]
        }));

        // 2. Données par Criticité (Pie Chart 2)
        const vulnCount = { critical: 0, high: 0, medium: 0, low: 0 };
        articles.forEach(a => {
            const level = getCriticality(a.title);
            vulnCount[level] = (vulnCount[level] || 0) + 1;
        });
        
        const vulnsData = [
            { name: 'Critical', value: vulnCount.critical, color: '#ff003c' },
            { name: 'High', value: vulnCount.high, color: '#ff8000' },
            { name: 'Medium', value: vulnCount.medium, color: '#ffd700' },
            { name: 'Low', value: vulnCount.low, color: '#00ff41' }
        ].filter(d => d.value > 0);

        setChartsData(prev => ({
          ...prev,
          sourcesData,
          vulnsData
        }));
      } catch (err) {
        console.error("Erreur chargement news:", err);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchStats();
    fetchNewsData();
  }, [userRole]);

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h2 className="page-title">SYSTEM_<span>DASHBOARD</span></h2>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Payloads Stockés</div>
          <div className="stat-value">{loadingStats ? <Skeleton width={60} height={40} /> : stats.payloads}</div>
          <Terminal size={40} className="stat-icon" />
        </div>

        {userRole !== ROLES.GUEST && (
          <>
            <div className="stat-card">
              <div className="stat-label">Cibles Actives</div>
              <div className="stat-value">{loadingStats ? <Skeleton width={60} height={40} /> : stats.targets}</div>
              <Target size={40} className="stat-icon" />
            </div>

            <div className="stat-card critical">
              <div className="stat-label">Machines compromises</div>
              <div className="stat-value">{loadingStats ? <Skeleton width={60} height={40} /> : String(stats.compromised).padStart(2, '0')}</div>
              <Box size={40} className="stat-icon" />
            </div>

            <div className="stat-card">
              <div className="stat-label">Opérations en cours</div>
              <div className="stat-value">{loadingStats ? <Skeleton width={60} height={40} /> : String(stats.inProgress).padStart(2, '0')}</div>
              <Zap size={40} className="stat-icon" />
            </div>
          </>
        )}
      </div>

      {/* GRAPHIQUES */}
      <div className="charts-grid">
        <div className="chart-card">
            <h3 className="chart-title"><Globe size={16} className="mr-2"/> RÉPARTITION_PAR_SOURCE</h3>
            {loadingNews ? <Skeleton width="100%" height={300} /> : (
            chartsData.sourcesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartsData.sourcesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartsData.sourcesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
            ) : (
              <div className="chart-empty-state">
                <Globe size={48} className="chart-empty-icon" />
                <span className="chart-empty-text">AUCUNE SOURCE DÉTECTÉE</span>
              </div>
            )
            )}
        </div>

        <div className="chart-card">
            <h3 className="chart-title"><ShieldAlert size={16} className="mr-2"/> VULNÉRABILITÉS_PAR_CRITICITÉ</h3>
            {loadingNews ? <Skeleton width="100%" height={300} /> : (
            chartsData.vulnsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={chartsData.vulnsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {chartsData.vulnsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
            ) : (
              <div className="chart-empty-state">
                <ShieldAlert size={48} className="chart-empty-icon" />
                <span className="chart-empty-text">AUCUNE VULNÉRABILITÉ</span>
              </div>
            )
            )}
        </div>
      </div>

      {/* NOUVELLE LIGNE DE GRAPHIQUES (Interne) */}
      {!loadingStats && userRole !== ROLES.GUEST && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title"><BarChart2 size={16} className="mr-2"/> DIFFICULTÉ_DES_MACHINES</h3>
            {chartsData.boxDifficultyData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartsData.boxDifficultyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#888" tick={{fill: '#888'}} />
                <YAxis stroke="#888" tick={{fill: '#888'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', color: '#fff' }} 
                  cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                />
                <Bar dataKey="value" fill="#00d4ff" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartsData.boxDifficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Insane' ? '#b026ff' : entry.name === 'Hard' ? '#ff003c' : entry.name === 'Medium' ? '#ff8000' : '#00ff41'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <div className="chart-empty-state">
                <BarChart2 size={48} className="chart-empty-icon" />
                <span className="chart-empty-text">AUCUNE MACHINE ACTIVE</span>
              </div>
            )}
          </div>

          <div className="chart-card">
            <h3 className="chart-title"><Monitor size={16} className="mr-2"/> RÉPARTITION_OS_CIBLES</h3>
            {chartsData.targetOsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartsData.targetOsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartsData.targetOsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={OS_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            ) : (
              <div className="chart-empty-state">
                <Monitor size={48} className="chart-empty-icon" />
                <span className="chart-empty-text">AUCUNE CIBLE DÉFINIE</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="activity-section">
         <h3 style={{color: '#ff003c', letterSpacing: '2px', marginBottom: '1rem'}}>LOGS_ACTIVITE_RECENTS</h3>
         <div className="activity-log-box">
            <p>{'>'} [SYSTEM] Initialisation du dashboard...</p>
            <p>{'>'} [INFO] Connexion à la base de données établie.</p>
            {!loadingStats && (
              <>
                {userRole === ROLES.GUEST ? (
                  <>
                    <p>{'>'} [SYSTEM] Accès invité restreint.</p>
                    <p>{'>'} [INFO] Consultation de la base de connaissances autorisée.</p>
                  </>
                ) : (
                  <>
                    <p>{'>'} [STATUS] {stats.payloads} vecteurs d'attaque chargés.</p>
                    <p>{'>'} [STATUS] {stats.targets} cibles identifiées dans le scope.</p>
                  </>
                )}
              </>
            )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
function DashboardMock() {
  return (
    <div className="dashboard-device">
      <div className="dash-top">
        <strong>AI Dashboard</strong>
        <div>
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="dash-layout">
        <aside>
          {['Clinical Home', 'Performance', 'Operations', 'Remote Setup', 'Dashboard'].map((item) => (
            <i key={item}>{item}</i>
          ))}
        </aside>
        <section>
          <div className="dash-stat">
            <span>AI Clinical System</span>
            <strong>31,231</strong>
          </div>
          <div className="world-map">
            <span />
            <span />
            <span />
          </div>
          <div className="dash-chart">
            {Array.from({ length: 18 }).map((_, index) => (
              <b key={index} style={{ height: `${22 + (index % 5) * 9}px` }} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardMock;

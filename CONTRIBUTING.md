# Contributing to AI-Powered Train Traffic Control System

We welcome contributions to improve this SIH 2025 project! This guide will help you get started.

## 🚀 Quick Start for Contributors

### Prerequisites
- Python 3.12+
- Node.js 22+
- Git knowledge
- Basic understanding of React and FastAPI

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/SIH2025.git
   cd SIH2025
   ```

2. **Set up development environment**
   ```bash
   # Backend setup
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt

   # Frontend setup
   cd ../frontend
   npm install
   ```

3. **Run in development mode**
   ```bash
   # Terminal 1: Backend
   cd backend && python main.py

   # Terminal 2: Frontend
   cd frontend && npm start
   ```

## 🎯 Areas for Contribution

### 🐛 High Priority Issues
- [ ] **Real WebSocket Integration**: Replace polling with true WebSocket streaming
- [ ] **SUMO Integration**: Connect with SUMO traffic simulator
- [ ] **Advanced Conflict Detection**: Multi-train scenario handling
- [ ] **Performance Optimization**: Reduce API response times

### 🔧 Medium Priority Features
- [ ] **Database Integration**: Replace JSON with PostgreSQL/MongoDB
- [ ] **Authentication System**: User management for controllers
- [ ] **Historical Analytics**: Performance tracking dashboard
- [ ] **Mobile Responsive**: Improve mobile interface

### 🎨 UI/UX Improvements
- [ ] **Dark Mode**: Add dark theme support
- [ ] **Accessibility**: WCAG compliance for screen readers
- [ ] **Animation Polish**: Smooth train movement animations
- [ ] **Interactive Tours**: Guided demo for new users

### 🧪 Testing & Quality
- [ ] **Unit Tests**: Backend service test coverage
- [ ] **E2E Tests**: Frontend automation with Cypress
- [ ] **Performance Tests**: Load testing for simulation
- [ ] **Code Quality**: ESLint/Prettier configuration

## 💻 Development Guidelines

### Code Style
- **Python**: Follow PEP 8, use Black formatter
- **TypeScript**: Use Prettier, follow React best practices
- **Commits**: Use conventional commits (feat:, fix:, docs:)

### Branch Naming
```
feature/websocket-integration
bugfix/simulation-timing-issue
docs/api-documentation
refactor/backend-structure
```

### Pull Request Process

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** with proper testing

3. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: add real-time WebSocket streaming for train updates

   - Replace HTTP polling with WebSocket connection
   - Add connection status indicators
   - Handle reconnection logic
   - Update frontend to consume WebSocket events"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create PR on GitHub with detailed description
   ```

## 🧪 Testing Your Changes

### Backend Testing
```bash
cd backend
python -m pytest tests/  # When tests are added
python main.py  # Manual testing
curl http://localhost:8000/api/status  # API testing
```

### Frontend Testing
```bash
cd frontend
npm test  # Run Jest tests
npm run build  # Test production build
npm start  # Development testing
```

### Integration Testing
1. Start both backend and frontend
2. Test full simulation workflow:
   - Start simulation → Disruption → Conflict → Resolution → Accept/Reject
3. Verify API responses and UI updates

## 📋 Reporting Issues

### Bug Reports
Use this template for bug reports:

```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Node.js version:
- Python version:

**Screenshots**
Add screenshots if applicable
```

### Feature Requests
```markdown
**Feature Description**
Clear description of the new feature

**Problem it Solves**
What problem does this address?

**Proposed Solution**
How should this be implemented?

**Alternatives Considered**
Other approaches you've thought about

**SIH 2025 Relevance**
How does this enhance the competition submission?
```

## 🎓 Learning Resources

### For Railway Domain Understanding
- [Indian Railways Operations](https://indianrailways.gov.in/)
- [Railway Signaling Systems](https://en.wikipedia.org/wiki/Railway_signalling)
- [Train Traffic Control](https://www.railway-technology.com/)

### For Technical Development
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)
- [D3.js Tutorials](https://d3js.org/)
- [WebSocket Programming](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

## 🏆 Recognition

Contributors will be:
- Added to the project's contributor list
- Mentioned in SIH 2025 presentation slides
- Credited in project documentation

## 📞 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For general questions and ideas
- **Discord**: [Create a server for real-time chat]

## 🚀 Release Process

### Version Numbering
- `v1.0.0`: SIH 2025 submission version
- `v1.1.0`: Post-SIH enhancements
- `v2.0.0`: Major architectural changes

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Demo video recorded
- [ ] Performance benchmarks
- [ ] Security review

## 🎯 SIH 2025 Specific

### Competition Requirements
Ensure all contributions maintain:
- ✅ Innovation in AI-powered traffic control
- ✅ Practical railway industry applicability  
- ✅ Scalable technical architecture
- ✅ User-friendly interface design
- ✅ Real-world problem solving focus

### Evaluation Criteria Focus
- **Technical Innovation**: Advanced AI algorithms
- **Implementation Quality**: Clean, maintainable code
- **User Experience**: Intuitive controller interface
- **Scalability**: Production-ready architecture
- **Documentation**: Comprehensive project docs

---

**Thank you for contributing to making Indian Railways smarter! 🚄🇮🇳**

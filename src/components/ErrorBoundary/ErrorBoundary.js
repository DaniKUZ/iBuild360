import React from 'react';
import PropTypes from 'prop-types';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContent}>
            <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
            <h2>Что-то пошло не так</h2>
            <p>Произошла ошибка при загрузке этой части приложения.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary; 
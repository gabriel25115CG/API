export const logEvents = async (req, res, next) => {
    const startTime = Date.now();
  
    res.on('finish', async () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
  
      const logData = {
        route: req.originalUrl,
        method: req.method,
        params: req.params || null,
        body: req.body || null,
        query: req.query || null,
        user: req.user ? req.user.uid : 'anonymous',
        statusCode: res.statusCode,
        duration,
        timestamp: new Date(),
      };
  
      try {
        console.log('Attempting to log:', logData); // Ajoutez ce log pour voir les données générées
        await admin.firestore().collection('logs').add(logData);
        console.log('Log successfully added to Firestore');
      } catch (error) {
        console.error('Error while logging event:', error.message);
      }
    });
  
    next();
  };
  
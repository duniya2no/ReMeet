// styles.js
import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

// Get screen width and height
const { width, height } = Dimensions.get('window');

// Define colors (can be imported if needed)
const COLORS = {
  background: '#F9F9F9',
  primary: '#4C8BF5',
  text: '#333',
  gray: '#aaa',
  card: '#fff',
  border: '#ddd',
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.08, // 8% of screen width
  },

  card: {
    alignItems: 'center',
  },

  title: {
    fontSize: width * 0.06, // 6% of screen width
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: height * 0.03, // 3% of screen height
  },

  phoneText: {
    color: '#fff',
    fontSize: width * 0.04, // 4% of screen width
    marginBottom: height * 0.03, // 3% of screen height
  },

  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: width * 0.05, // 5% of screen width
    padding: width * 0.04, // 4% of screen width
    marginBottom: height * 0.05, // 5% of screen height
    textAlign: 'center',
    fontSize: width * 0.04, // 4% of screen width
    color: '#000',
  },

  nextButton: {
    backgroundColor: '#4C8BF5',
    padding: width * 0.04, // 4% of screen width
    borderRadius: width * 0.05, // 5% of screen width
    width: '100%',
    alignItems: 'center',
  },

  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.04, // 4% of screen width
  },

  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: height * 0.03, // 3% of screen height
  },

  codeBox: {
    width: width * 0.12, // 12% of screen width
    height: width * 0.15, // 15% of screen width
    marginHorizontal: width * 0.02, // 2% of screen width
  },

  codeInput: {
    width: width * 0.12, // 12% of screen width
    height: width * 0.15, // 15% of screen width
    backgroundColor: '#fff',
    borderRadius: width * 0.02, // 2% of screen width
    textAlign: 'center',
    fontSize: width * 0.05, // 5% of screen width
    color: '#000',
  },

  timerText: {
    color: '#ddd',
    marginTop: height * 0.02, // 2% of screen height
  },

  resendText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: height * 0.02, // 2% of screen height
  },
});

export default styles;

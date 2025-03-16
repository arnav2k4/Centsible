import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf
from sklearn.ensemble import RandomForestRegressor
from scipy.optimize import minimize
from flask import Flask

# User Input
fixed_income = float(input("Enter your fixed income: "))
variable_income = float(input("Enter your variable income (if any): "))
fixed_expenses = float(input("Enter your fixed expenses: "))
variable_expenses = float(input("Enter your variable expenses: "))
misc_expenses = float(input("Enter your miscellaneous expenses: "))
risk_appetite = input("Enter your risk appetite (low, medium, high): ").lower()

# Calculate Savings
income = fixed_income + variable_income
expenses = fixed_expenses + variable_expenses + misc_expenses
savings = income - expenses
# Allocate Savings Based on Risk Appetite
investment_allocation = {'low': 0.15, 'medium': 0.35, 'high': 0.50}
investment_amount = savings * investment_allocation[risk_appetite]
remaining_savings = savings - investment_amount

# Fetch Market Data
assets = ["AAPL", "TSLA", "BTC-USD", "ETH-USD", "GLD", "TLT", "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", 'AXISBANK.NS', 'REI',
          "INFY.NS", "ICICIBANK.NS", "SBIN.NS", "BAJFINANCE.NS", "BHARTIARTL.NS", "ASIANPAINT.NS", "MARUTI.NS"]
data = yf.download(assets, start="2023-01-01", end="2025-03-16", auto_adjust=False)["Adj Close"]

# Calculate Returns
returns = data.pct_change(fill_method=None).dropna()
mean_returns = returns.mean() * 252
cov_matrix = returns.cov() * 252

def portfolio_performance(weights, mean_returns, cov_matrix):
    port_return = np.dot(weights, mean_returns)
    port_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
    return port_return, port_volatility

def negative_sharpe_ratio(weights, mean_returns, cov_matrix, risk_free_rate=0.02):
    port_return, port_volatility = portfolio_performance(weights, mean_returns, cov_matrix)
    return -(port_return - risk_free_rate) / port_volatility

constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
bounds = [(0, 1) for _ in range(len(assets))]
initial_weights = np.array([1/len(assets)] * len(assets))

optimized = minimize(negative_sharpe_ratio, initial_weights, args=(mean_returns, cov_matrix),
                     method='SLSQP', bounds=bounds, constraints=constraints)
optimal_weights = optimized.x

# Asset Categories
investment_types = {
    'crypto': ['BTC-USD', 'ETH-USD'],
    'stocks': ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'SBIN.NS', 
               'BAJFINANCE.NS', 'BHARTIARTL.NS', 'ASIANPAINT.NS', 'MARUTI.NS'],
    'bonds': ['TLT'],
    'mutual_funds': ['AXISBANK.NS'],
    'real_estate': ['REI']
}

# Adjustments for each risk appetite
def get_optimized_portfolio(risk_appetite):
    base_allocation = optimal_weights.copy()
    
    # Define adjustment factors for each category based on risk appetite
    adjustments = {
        'low': [0.8, 0.8, 0.3, 0.3, 1.2, 1.2, 1.4, 1.4, 0.4, 0.4, 0.8, 0.8, 1.0, 1.0, 1.2, 1.2, 1.4, 1.4],
        'medium': [1.0, 1.0, 0.7, 0.7, 1.0, 1.0, 0.3, 0.3, 1.2, 1.2, 1.4, 1.4, 1.2, 1.5, 1.5, 1.4, 1.0, 1.0,],
        'high': [1.2, 1.2, 1.5, 1.5, 0.8, 0.6, 0.7, 1.0, 1.0, 0.3, 0.3, 0.8, 0.8, 0.3, 0.3, 0.7, 0.7, 0.7]
    }

    # Flatten the adjustments array
    category_adjustments = adjustments[risk_appetite]
    
    # Apply the adjustment factors for each asset category
    base_allocation *= np.array(adjustments[risk_appetite])
    
    # Normalize so the sum of weights adds to 1
    return base_allocation / np.sum(base_allocation)

# Generate optimized portfolios for each risk appetite
portfolios = {risk: get_optimized_portfolio(risk) for risk in ['low', 'medium', 'high']}
# ML Model for Expense & Savings Prediction
np.random.seed(42)
past_data = pd.DataFrame({
    'fixed_expenses': np.random.uniform(fixed_expenses * 0.9, fixed_expenses * 1.1, 90),
    'variable_expenses': np.random.uniform(variable_expenses * 0.8, variable_expenses * 1.2, 90),
    'misc_expenses': np.random.uniform(misc_expenses * 0.7, misc_expenses * 1.3, 90),
    'savings': np.random.uniform(remaining_savings * 0.85, remaining_savings * 1.15, 90)
})

X_train = past_data.drop(columns=['savings'])
y_train = past_data['savings']

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

future_expenses = np.array([[fixed_expenses, variable_expenses, misc_expenses]])
predicted_savings = model.predict(future_expenses)

print(f"Predicted Savings for Next Month: ${predicted_savings[0]:.2f}")

'''# Display Portfolio Allocation
print(f"\n{risk_appetite.capitalize()} Risk Portfolio Allocation:")
for asset, weight in zip(assets, portfolios[risk_appetite]):
    print(f"  {asset}: {weight:.2%}")'''

# Show Amount of Money Invested in Each Asset
print(f"\n{risk_appetite.capitalize()} Risk Portfolio Allocation:")
'''for asset, weight in zip(assets, portfolios[risk_appetite]):
    invested_amount = investment_amount * weight
    print(f"  {asset}: ${invested_amount:.2f}")'''

'''# Investment Actions Breakdown
print("\nInvestment Actions Breakdown:")
for category, assets_in_category in investment_types.items():
    print(f"\n{category.capitalize()} Investments:")
    for asset in assets_in_category:
        # Get the index of the asset in the assets list
        asset_index = assets.index(asset)
        
        # Get the allocation weight for that asset from the portfolio
        allocation_percentage = portfolios[risk_appetite][asset_index] * 100
        
        print(f"  {asset}: {allocation_percentage:.2f}%")'''


app = Flask(__name__)
@app.route('/')
def home():
    output=[]
# Investment Actions Breakdown
    message=("\nInvestment Actions Breakdown:")
    output.append(message)
    for category, assets_in_category in investment_types.items():
        output.append(f"\n{category.capitalize()} Investments:")
        for asset in assets_in_category:
            # Get the index of the asset in the assets list
            asset_index = assets.index(asset)
            
            # Get the allocation weight for that asset from the portfolio
            allocation_percentage = portfolios[risk_appetite][asset_index] * 100
            
            # Calculate the amount of money invested in the asset
            invested_amount = investment_amount * portfolios[risk_appetite][asset_index]
            
            # Print the results
            output.append(f"  {asset}: ${invested_amount:.2f} invested")
    result = "<br>".join(output)
    return f"<p>{result}</p>"
if __name__ == '__main__':
    app.run(debug=False)
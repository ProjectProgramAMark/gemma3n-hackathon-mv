import matplotlib.pyplot as plt


def plot_metrics(log_history):
    # Extracting training and evaluation loss
    training_loss = [log['loss'] for log in log_history if 'loss' in log]
    eval_loss = [log['eval_loss'] for log in log_history if 'eval_loss' in log]

    # Plotting
    fig, axs = plt.subplots()
    plt.plot(training_loss, label='Training Loss')
    plt.plot(eval_loss, label='Evaluation Loss')
    plt.xlabel('Steps')
    plt.ylabel('Loss')
    plt.title('Training and Evaluation Loss')
    plt.legend()
    plt.close(fig)

    return fig